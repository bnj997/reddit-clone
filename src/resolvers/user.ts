import { Resolver, Query, Ctx, Int, Arg, Mutation, InputType, Field, ObjectType } from "type-graphql";
import { User } from "../entities/User";
import argon2 from 'argon2';
import { MyContext } from "src/types";

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
    //you are not logged in 
    if(!req.session!.userId) {
      return null
    }
    const user = await em.findOne(User, {id: req.session!.userId})
    return user
  }


  //Register User
  @Mutation(() => UserResponse)
  async registerUser(
    @Arg("options", () => UsernamePasswordInput) options: UsernamePasswordInput,
    @Ctx() {req, em}: MyContext
  ): Promise<UserResponse> {

    if (options.username.length < 2) {
      return {
        errors: [
          {
            field: "username",
            message: "length must be greater than 2"
          },
        ],
      }
    }

    if (options.password.length < 5) {
      return {
        errors: [
          {
            field: "password",
            message: "length must be greater than 5"
          },
        ],
      }
    }

    const hashedPassword = await argon2.hash(options.password)
    const user = em.create(User, {
      username: options.username, 
      password: hashedPassword 
    });
    try {
      await em.persistAndFlush(user);
    } catch(err){
      //duplicate username error
      if (err.code === "23505") {
        return {
          errors: [
            {
              field: "username",
              message: "username already taken",
            },
          ],
        }
      }
    }

    req.session!.userId = user.id; 
    
    return {
      user,
    };
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
            message: "Incorrect passwords"
          },
        ],
      };
    }

    req.session!.userId = user.id; 

    return {
      user,
    };

  }


}
