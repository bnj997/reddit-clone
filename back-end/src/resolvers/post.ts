//Bunch of queiries and mutations used to fetch or update POSTS

import { Resolver, Query, Int, Arg, Mutation } from "type-graphql";
import { Post } from "../entities/Post";

@Resolver()
export class PostResolver {
  
  //Get All Posts
  //return type is the Graphql Post type 
  @Query(() => [Post])
  //In order to query database, need to access the mikroORM "orm.em" object that was made in index.ts. 
  //This was done via context object called "em"
  //use @Ctx() {em}: MyContext to access this object
  //To ensure that "em" is of correct context type, we define it as of type MyContext (see types.ts for more description)
  //return type of this "find" method is the typeScript "Post" type
  //NOTE: you may see that we are type checking both the GraphQL Post type and typescript Post type. 
  getAllPosts(): Promise<Post[]> {
    return Post.find()
  }

  //Get a Single Post
  //return type is the Graphql Post type  or null type
  @Query(() => Post, {nullable: true})
  getASinglePost(
    //@Arg is like a parameter which is needed to query which psot you want
    //'id', () => Int  --> represents the graphql type
    //id: number --> represents the typescript type
     //return type of this findOne method is typescript type "Post or null" type
    @Arg("id", () => Int) id: number): Promise<Post | undefined> {  
    return Post.findOne(id)
  }

  //Create Post
  @Mutation(() => Post)
  async createPost(
    //"title", () => String  --> represents the graphql type
    //title: stringr --> represents the typescript type
    @Arg("title", () => String) title: string): Promise<Post> {
    return Post.create({title}).save();
  }

  //Update Post
  @Mutation(() => Post, {nullable: true})
  async updatePost(
    //@Arg is like a parameter which is needed to query which psot you want
    //'id', () => Int  --> represents the graphql type
    //id: number --> represents the typescript type
    @Arg("id", () => Int) id: number,
    //"title", () => String  --> represents the graphql type
    //title: string --> represents the typescript type
    @Arg("title", () => String, {nullable: true}) title: string,      
  ): Promise<Post | null> {
    //find the post with that id
    const post = await Post.findOne(id);
    if(!post) {
      return null
    }
    //if the title you provided had any value, update and post
    if (typeof title !== 'undefined') {
      await Post.update({id}, {title})
    }
    return post
  }

  //Delete Post
  @Mutation(() => Boolean)
  async deletePost(@Arg("id", () => Int) id: number,   ): Promise<boolean> {
    await Post.delete(id)
    return true;
  }

}