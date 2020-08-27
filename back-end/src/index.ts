//Required for type graphql to work
import 'reflect-metadata';


import { MikroORM } from "@mikro-orm/core";
import { __prod__, COOKIE_NAME } from "./constants";
import microConfig from "./mikro-orm.config";
import express from 'express'
import { ApolloServer } from 'apollo-server-express'
import { buildSchema } from 'type-graphql';
import { PostResolver } from "./resolvers/post";
import { UserResolver } from './resolvers/user';
import redis from 'redis';
import session from 'express-session';
import connectRedis from 'connect-redis'
import cors from 'cors'


const main = async () => {
  //CREATES CONNECTION TO DATABASE and initialises with  correct config using the microConfig file
  //This file contains dbName, type of database, username and password to ensure secure connection to database
  //Note: To create new table, go to microconfig table and add in a new entity then run mikro-orm migration:create
  const orm = await MikroORM.init(microConfig);

  //Run migrations on each server restart
  //Migrations ensure that the entities we made match to what is currently in the database and updates it accordingly.
  //Note: "create()" looks at current PostgresSQL database and creates the SQL statements to push the entities we defined into the database
  //Note: "up()" builds the SQL from what database was before in previous migration and updates it to the current migration. Aka - runs any new migrations we made with create()
  //Note: MikroORM compares the entities with database and may find that an entity you coded is exactly what it is in database so migrations files could be empty
  //Does not run old migrations - mikroORM makes own table in postgresSQL and keeps track of which migration has run and has not run
  orm.getMigrator().up();


  //Express is just the server we will be using
  const app = express();

  const RedisStore = connectRedis(session)
  const redisClient = redis.createClient()

  app.use(
    cors({
      origin: "http://localhost:3000",
      credentials: true,
    })
  );
  
  app.use(
    session({
      name: COOKIE_NAME,
      store: new RedisStore({ 
        client: redisClient,
        disableTouch: true,
      }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10,
        httpOnly: true,
        sameSite: "lax", //csrf

        secure: false,
      },
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
    context: ({req, res}) => ({em: orm.em, req, res})
  });


  //... and then this CREATE GRAPHQL ENDPOINT FOR US ON EXPRESS SERVER to enable us to access this information
  //this one single endpoint is just localhost:4000/graphql and this is where you just ask for what you want'
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
