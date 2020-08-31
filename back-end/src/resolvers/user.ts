//All of the queries that you can run as part of your API

import { Resolver, Query, Ctx, Arg, Mutation, Field, ObjectType } from "type-graphql";
import { User } from "../entities/User";
import argon2 from 'argon2';
import { MyContext } from "src/types";
import { EntityManager } from '@mikro-orm/postgresql'
import { COOKIE_NAME } from "../constants";
import { UsernamePasswordInput } from "./UsernamePasswordInput";
import { validateRegister } from "../utils/validateRegister";

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
  @Mutation(() => Boolean)
  async forgotPassword(
    @Arg('email') email: string,
    @Ctx() {em}: MyContext
  ) {
    const user = await em.findOne(User, {email})
  }

  //Get current User
  @Query(() => User, {nullable: true})
  async getCurrentUser (
    @Ctx() { req, em }: MyContext
  ) {
    console.log("session: ", req.session)
    //you are not logged in 
    if(!req.session.userId) {
      return null
    }
    const user = await em.findOne(User, {id: req.session.userId})
    return user
  }


  //Register User
  @Mutation(() => UserResponse)
  async registerUser(
    //removes the need to make multiple @Args
    //Basically allows you to create multiple fields using one @Args
    @Arg("options", () => UsernamePasswordInput) options: UsernamePasswordInput,
    //context has the req object which is used to access sessions
    @Ctx() {em, req}: MyContext
  ): Promise<UserResponse> {
    const errors = validateRegister(options);
    if (errors) {
      return {errors};
    }

    //Just hashes the password using argon2
    const hashedPassword = await argon2.hash(options.password)
    let user;
    try {
      //Not using mikroorm to insert since using Knex, so need to add in own created at and update at fields
      //use underscores for created at and update at since thats what database uses
      const result = await (em as EntityManager)
        .createQueryBuilder(User)
        .getKnexQuery()
        .insert({
          username: options.username, 
          email: options.email,
          password: hashedPassword ,
          created_at: new Date(),
          updated_at: new Date(),
        }).returning("*");
      //result[0] refers to the actual user
      user = result[0];
    } catch(err){
      console.log(err)
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
    @Ctx() {em, req}: MyContext
  ): Promise<UserResponse> {
    const user = await em.findOne(User, 
      usernameOrEmail.includes('@') 
      ? {email: usernameOrEmail}
      : {username: usernameOrEmail}
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
