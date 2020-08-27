//Bunch of queiries and mutations used to fetch or update POSTS

import { Resolver, Query, Ctx, Int, Arg, Mutation } from "type-graphql";
import { Post } from "../entities/Post";
import { MyContext } from "src/types";

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
  getAllPosts(@Ctx() {em}: MyContext): Promise<Post[]> {
    return em.find(Post, {})
  }

  //Get a Single Post
  //return type is the Graphql Post type  or null type
  @Query(() => Post, {nullable: true})
  getASinglePost(
    //@Arg is like a parameter which is needed to query which psot you want
    //'id', () => Int  --> represents the graphql type
    //id: number --> represents the typescript type
    @Arg('id', () => Int) id: number,    
    @Ctx() {em}: MyContext
    //return type of this findOne method is typescript type "Post or null" type
    ): Promise<Post | null> {
    return em.findOne(Post, { id })
  }

  //Create Post
  @Mutation(() => Post)
  async createPost(
    //"title", () => String  --> represents the graphql type
    //title: stringr --> represents the typescript type
    @Arg("title", () => String) title: string,    
    @Ctx() { em }: MyContext
  ): Promise<Post> {
    const post = em.create(Post, {title});
    await em.persistAndFlush(post)
    return post
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
    @Ctx() { em }: MyContext
  ): Promise<Post | null> {
    //find the post with that id
    const post = await em.findOne(Post, {id});
    if(!post) {
      return null
    }
    //if the title you provided had any value, update and post
    if (typeof title !== 'undefined') {
      post.title = title
      await em.persistAndFlush(post)
    }
    return post
  }

  //Delete Post
  @Mutation(() => Boolean)
  async deletePost(
    @Arg("id") id: number,    
    @Ctx() { em }: MyContext
  ): Promise<boolean> {
    try {
      await em.nativeDelete(Post, {id})
    } catch {
      return false;
    }
    return true;
  }

}