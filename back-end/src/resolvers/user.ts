import { Resolver, Query, Ctx, Arg, Mutation, InputType, Field, ObjectType } from "type-graphql";
import { User } from "../entities/User";
import argon2 from 'argon2';
import { MyContext } from "src/types";
import { EntityManager } from '@mikro-orm/postgresql'
import { COOKIE_NAME } from "../constants";

// Input types are used for argumenets
@InputType()
class UsernamePasswordInput {
  @Field()
  username: string
  @Field()
  password: string
}

//Done if there is soemthing wrong in a particular field
@ObjectType()
class FieldError {
  @Field(()=> String)
  field: string;
  @Field(()=> String)
  message: string;
}

//Object types we return from mutation
//Want user returned if it worked properly OR I want error returned if error is present
@ObjectType()
class UserResponse {
  @Field(()=> [FieldError], {nullable: true})
  errors?: FieldError[]
  @Field(()=> User, {nullable: true})
  user?: User
}

@Resolver()
export class UserResolver {

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
    @Arg("options", () => UsernamePasswordInput) options: UsernamePasswordInput,
    @Ctx() {em, req}: MyContext
  ): Promise<UserResponse> {

    if (options.username.length < 2) {
      return {
        errors: [
          {
            field: "username",
            message: "Length must be greater than 2"
          },
        ],
      }
    }

    if (options.password.length < 5) {
      return {
        errors: [
          {
            field: "password",
            message: "Length must be greater than 5"
          },
        ],
      }
    }

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
          password: hashedPassword ,
          created_at: new Date(),
          updated_at: new Date(),
        }).returning("*");
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

    req.session.userId = user.id;
    
    return {user};
  }

  //Login User
  @Mutation(() => UserResponse)
  async loginUser(
    @Arg("options", () => UsernamePasswordInput) options: UsernamePasswordInput,
    @Ctx() {em, req}: MyContext
  ): Promise<UserResponse> {
    const user = await em.findOne(User, {username: options.username})

    if (!user) {
      return {
        errors: [
          {
            field: "username",
            message: "Username does not exist"
          },
        ],
      };
    }

    const valid = await argon2.verify(user.password, options.password)
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
    return new Promise(resolve => 
      req.session.destroy(err => {
        res.clearCookie(COOKIE_NAME);
        if (err) {
          console.log(err)
          resolve(false)
          return
        }

        resolve(true);
      })
    );
  } 
}
