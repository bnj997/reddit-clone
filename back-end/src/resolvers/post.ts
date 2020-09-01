//Bunch of queiries and mutations used to fetch or update POSTS
import { Resolver, Query, Int, Arg, Mutation, InputType, Field, Ctx, UseMiddleware, FieldResolver, Root, ObjectType } from "type-graphql";
import { Post } from "../entities/Post";
import { MyContext } from "../types";
import { isAuth } from "../middleware/isAuth";
import { getConnection } from "typeorm";

@InputType()
class PostInput {
  @Field(() => String)
  title: string;
  @Field(() => String)
  text: string;
}

@ObjectType()
class PaginatedPosts {
  @Field(() => [Post])
  posts: Post[];
  @Field()
  hasMore: boolean;
}


@Resolver(Post)
export class PostResolver {

  //Will be called everytime we get post object
  //Aim is just to convert the text into a snippet
  //ensure not pulling the entire text body from database
  @FieldResolver(() => String)
  textSnippet(
    @Root() root: Post
  ) {
    return root.text.slice(0, 50)
  }
  
  //Get All Posts
  //return type is the Graphql Post type 
  @Query(() => PaginatedPosts)
  //In order to query database, need to access the mikroORM "orm.em" object that was made in index.ts. 
  //This was done via context object called "em"
  //use @Ctx() {em}: MyContext to access this object
  //To ensure that "em" is of correct context type, we define it as of type MyContext (see types.ts for more description)
  //return type of this "find" method is the typeScript "Post" type
  //NOTE: you may see that we are type checking both the GraphQL Post type and typescript Post type. 
  async getAllPosts(
    @Arg('limit', () => Int) limit: number,
    //cursor dicates that you want posts after this point and dictates how you sort it
    //acts like a condition statement that is met before you fetch the posts based on ordering + number to displau
    @Arg('cursor', () => String, {nullable: true}) cursor: string | null
  ): Promise<PaginatedPosts> {
    //user inputs what limit they want unless its over 50, in which case we cap it at 50
    //eg. user asks for 20 posts, actually fetching 21
    const realLimit = Math.min(50, limit);
    const realLimitPlusOne = realLimit + 1;
    const qb = getConnection()
      .getRepository(Post)
      .createQueryBuilder("p")
      .orderBy('"createdAt"', "DESC")
      .take(realLimitPlusOne)
    if (cursor) {
      //if post is newer than selected date, show
      qb.where('"createdAt" < :cursor', {
        cursor: new Date(parseInt(cursor)),
      }); 
    }
    const posts = await qb.getMany()
    return { 
      //eg. only want to return 20 not 21 posts
      posts: posts.slice(0, realLimit), 
      //if we can return 21 posts even though just asked for 20, we know theres more data to load when loadmore pressed again
      hasMore: posts.length === realLimitPlusOne
    };
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
  //this middleware will check if we have user id within the session before it actually runs the resolver
  @UseMiddleware(isAuth)
  async createPost(
    //"title", () => String  --> represents the graphql type
    //title: stringr --> represents the typescript type
    @Arg("input", () => PostInput) input: PostInput,
    @Ctx() {req}: MyContext
    ): Promise<Post> {
    return Post.create({
      ...input,
      creatorId: req.session.userId,
    }).save();
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
  async deletePost(@Arg("id", () => Int) id: number): Promise<boolean> {
    await Post.delete(id)
    return true;
  }

}