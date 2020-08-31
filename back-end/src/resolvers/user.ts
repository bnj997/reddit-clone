//All of the queries that you can run as part of your API
import { Resolver, Query, Ctx, Arg, Mutation, Field, ObjectType } from "type-graphql";
import { User } from "../entities/User";
import { MyContext } from "src/types";
import { COOKIE_NAME, FORGET_PASSWORD_PREFIX } from "../constants";
import { UsernamePasswordInput } from "./UsernamePasswordInput";
import { validateRegister } from "../utils/validateRegister";
import { sendEmail } from "../utils/sendEmail";
import { v4 } from 'uuid';
import argon2 from 'argon2';
import { getConnection } from "typeorm";

//Object types we return from mutation
//Want user returned if it worked properly OR I want error returned if error is present
@ObjectType()
class UserResponse {
  @Field(()=> [FieldError], {nullable: true})
  //? just in case no errors
  errors?: FieldError[]
  @Field(()=> User, {nullable: true})
  //? just in case no users
  user?: User
}
//Done if there is soemthing wrong in a particular field
@ObjectType()
class FieldError {
  @Field(()=> String)
  field: string;
  @Field(()=> String)
  message: string;
}


@Resolver()
export class UserResolver {

  @Mutation(() => UserResponse)
  async changePassword(
    @Arg('token') token: string,
    @Arg('newPassword') newPassword: string,
    @Ctx() {redis, req}: MyContext
  ): Promise<UserResponse> {
    if (newPassword.length < 5) {
      return { 
        errors: [
          {
            field: "newPassword",
            message: "Length must be greater than 5"
          },
        ]
      }
    }

    const key = FORGET_PASSWORD_PREFIX+token
    const userId = await redis.get(key)
    if (!userId) {
      return {
        errors: [
          {
            field: "token",
            message: "Token expired"
          },
        ]
      }
    }

    //Update user password if all g
    const userIdNum = parseInt(userId)
    const user = await User.findOne(userIdNum);
    if(!user) {
      return {
        errors: [
          {
            field: "token",
            message: "User no longer exists"
          },
        ]
      };
    }

    user.password = await argon2.hash(newPassword)
    await User.update(
      { id: userIdNum }, 
      { password: await argon2.hash(newPassword) }
    );

    await redis.del(key)

    //login user after change password
    //remove if you want them to re log in
    req.session.userId = user.id

    return { user };
  }


  @Mutation(() => Boolean)
  async forgotPassword(
    @Arg('email') email: string,
    @Ctx() {redis}: MyContext
  ) {
    //cant just use findOne since not searchibg by primary key so need to include the where keyword
    const user = await User.findOne({where: {email}});
    if (!user) {
      //email not in database and return true to not tell user that this email was not found
      return true;
    }

    //create token
    const token = v4();
    //store in edis
    await redis.set(
      FORGET_PASSWORD_PREFIX + token, 
      user.id, 
      'ex', 
      1000 * 60 * 60 * 24 * 3
    ); //3 days
    
    //whenever user changes password, they will send token to server and then will look up value to get their userid
    await sendEmail(
      email, 
      `<a href="http://localhost:3000/change-password/${token}">reset password</a>`
    )
    
    return true;
  }

  //Get current User
  @Query(() => User, {nullable: true})
  getCurrentUser (@Ctx() { req }: MyContext) {
    //you are not logged in 
    if(!req.session.userId) {
      return null
    }
    return User.findOne(req.session.userId)
  }


  //Register User
  @Mutation(() => UserResponse)
  async registerUser(
    //removes the need to make multiple @Args
    //Basically allows you to create multiple fields using one @Args
    @Arg("options", () => UsernamePasswordInput) options: UsernamePasswordInput,
    //context has the req object which is used to access sessions
    @Ctx() {req}: MyContext
  ): Promise<UserResponse> {
    const errors = validateRegister(options);
    if (errors) {
      return {errors};
    }

    //Just hashes the password using argon2
    const hashedPassword = await argon2.hash(options.password)
    let user;
    try {
      // user = User.create({
      //   username: options.username, 
      //   email: options.email,
      //   password: hashedPassword 
      // }).save()

      const result = await getConnection()
        .createQueryBuilder()
        .insert()
        .into(User)
        .values({
          username: options.username, 
          email: options.email,
          password: hashedPassword 
        })
        .returning('*')
        .execute();
      //gets the result of the query and put in a user variable
      // console.log(result)
      user = result.raw[0];
      // console.log(user)
    } catch(err){
      console.log("Error: ", err)
      if (err.code === "23505" ) {
        return {
          errors: [
            {
              field: "username",
              message: "Username already taken",
            },
          ],
        }
      }
    }

    //can store the userid in the session object which is part of the request object
    req.session.userId = user.id;

    
    //Need to put user in {} because we are returning a UserResponse Object which contains both user and error
    return {user};
  }

  //Login User
  @Mutation(() => UserResponse)
  async loginUser(
    //enable users to input their username or email
    @Arg("usernameOrEmail") usernameOrEmail: string,
    @Arg("password") password: string,
    @Ctx() {req}: MyContext
  ): Promise<UserResponse> {
    const user = await User.findOne(
      usernameOrEmail.includes('@') 
        ? {where: {email: usernameOrEmail}}
        : {where: {username: usernameOrEmail}}
    );
    if (!user) {
      return {
        errors: [
          {
            field: "usernameOrEmail",
            message: "Username does not exist"
          },
        ],
      };
    }

    const valid = await argon2.verify(user.password, password)
    if (!valid) {
      return {
        errors: [
          {
            field: "password",
            message: "Incorrect password"
          },
        ],
      };
    }

    req.session.userId = user.id;

    return {user};
  }

  @Mutation(() => Boolean)
  logoutUser(@Ctx() {req, res}: MyContext) {
    //runs this callback function which aims to destroy session
    return new Promise(resolve => 
      req.session.destroy(err => {
        //clear cookie from clients browser
        res.clearCookie(COOKIE_NAME);
        if (err) {
          console.log(err)
          //return false if error
          resolve(false)
          return
        }
        //return true if error
        resolve(true);
      })
    );
  } 
}
