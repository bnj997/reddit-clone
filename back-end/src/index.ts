//Required for type graphql to work
import 'reflect-metadata';
import { __prod__, COOKIE_NAME } from "./constants";
import express from 'express'
import { ApolloServer } from 'apollo-server-express'
import { buildSchema } from 'type-graphql';
import { PostResolver } from "./resolvers/post";
import { UserResolver } from './resolvers/user';
import Redis from 'ioredis';
import session from 'express-session';
import connectRedis from 'connect-redis'
import cors from 'cors'
import { createConnection } from 'typeorm';
import { Post } from './entities/Post';
import { User } from './entities/User';



const main = async () => {
  const conn = await createConnection({
    type: 'postgres',
    database: 'lireddit2',
    username: 'postgres',
    password: 'postgres',
    logging: true,
    synchronize: true,
    entities: [Post, User]
  })
  //CREATES CONNECTION TO DATABASE and initialises with  correct config using the microConfig file
  //This file contains dbName, type of database, username and password to ensure secure connection to database
  //Note: To create new table, go to microconfig table and add in a new entity then run mikro-orm migration:create
  //

  //Run migrations on each server restart
  //Migrations ensure that the entities we made match to what is currently in the database and updates it accordingly.
  //Note: "create()" looks at current PostgresSQL database and creates the SQL statements to push the entities we defined into the database
  //Note: "up()" builds the SQL from what database was before in previous migration and updates it to the current migration. Aka - runs any new migrations we made with create()
  //Note: MikroORM compares the entities with database and may find that an entity you coded is exactly what it is in database so migrations files could be empty
  //Does not run old migrations - mikroORM makes own table in postgresSQL and keeps track of which migration has run and has not run
  //


  //Express is just the server we will be using
  //Is a framework that runs within Node.js that is used to maintain and create servers
  //express used to create server-side logic - aka.responds to incoming requests over HTTP
  //"middleware" are functions that have access to req objects and response objects
  const app = express();


  //Redis is in-memory database where we will store our sessions
  //This implements our REDIS CLIENT that will use our redis database
  
  //Sessions contain information about the user and in this case, we will store their userId
  //This line ensures that our sessions will be stored in redis
  //FLOW OF LOGIC
  // -> store userid into sessions which is stored in redis database as key valye pairs {key: session , value: userId}
  // -> express-session will set the cookie in user browser. This cookie is signed version of session key (which corresponds to their userId) 
  // -> when user make request, cookie in browser is sent to server which unsigns cookie using "secret". This turns cookie back into session key
  // -> session id is then converted into user id. 
  // -> Ultimately, this enables the users cookie to tell server who the user id
  const RedisStore = connectRedis(session)
  const redis = new Redis();

  //Prevent cors error by defining where the requests will be made from. It is originally a "*"
  //Now cors is applied to all routes.
  //credentials to true so can accept cookies
  app.use(
    cors({
      origin: "http://localhost:3000",
      credentials: true,
    })
  );
  
  //This middleware is above apollo middware since we will use this sessions middleware in the apollo middleware
  //Ensures the server uses sessions
  app.use(
    session({
      name: COOKIE_NAME,
      //Basically connects the redis client to our redis store logic we defined above
      //aka. we store the sessions we made into redis
      store: new RedisStore({ 
        //tells session we will be storing it on this redis client
        client: redis,
        //when data is stored in redis, we can say how long it should last in redis and usually we will keep session alive if user keeps interacting with session. Otherwise it will expire
        //In this case, just want to disable it for now so dont need to keep making request to redis
        disableTouch: true,
      }),
      //This will be stored in browser which contains signed version of session key.
      //when user makes request to browser, this cookie will be sent to server which is unsigned using secret and then this session key is used to access their user id
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10,
        //In javascript code in front end, you cannot access the cookie 
        httpOnly: true,
        //Protects against csrf
        sameSite: "lax", 
        //cookie only works in https. 
        //If prod is true, then secure will be true anmd otherwise
        secure: __prod__,
      },
      //Will create session by default even if you dont store any data in the session 
      //Setting it to false prevents sessions from being created if it doesnt contain any data
      saveUninitialized: false,
      secret: "meepmoopboom",
      resave: false,
    })
  )
  

  //ApolloServer allows us to use graphql and create graphql endpoints easily.
  //Note: Usually to create REST endpoint, you would use app.get("/", (req, res)) and then run function to create server.
  //ApolloServer builds the GRAPHQL SCHEMAS which contains references to 1. Object Type definitions and 2. The queries and mutations. These two pieces of info formed within the resolvers
  const apolloServer = new ApolloServer({
    //Need to pass in graphQL Schema
    schema: await buildSchema({
      resolvers: [PostResolver, UserResolver],
      validate: false,
    }),

    //Special object that is accessible by all resolvers. 
    //Format: function that returns object
    //Can make the "orm.em" object accessible to all Resolvers through variable "em" so they can do crud operations via mikroORM
    //To access sessions inside our resolvers, pass in the the request and response to our context. 
    //Express allows us to access these req, res objects through context function
    context: ({req, res}) => ({req, res, redis})
  });


  //... and then this CREATE GRAPHQL ENDPOINT FOR US ON EXPRESS SERVER to enable us to access this information
  //this one single endpoint is just localhost:4000/graphql and this is where you just ask for what you want'
  //set cors to false since using seperate package to handle cors for us.
  apolloServer.applyMiddleware({
    app,
    cors: false,
  });


  app.listen(4000, () => {
    console.log('server started at localhost:4000')
  });


}

main().catch((err) => {
  console.error(err);
});
