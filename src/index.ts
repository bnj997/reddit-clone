import 'reflect-metadata';
import {MikroORM} from "@mikro-orm/core";
import { __prod__ } from "./constants";
import microConfig from "./mikro-orm.config";
import express from 'express'
import {ApolloServer} from 'apollo-server-express'
import {buildSchema} from 'type-graphql';
import { PostResolver } from "./resolvers/post";

const main = async () => {
  //connect to database
  const orm = await MikroORM.init(microConfig);
  //run migrations
  orm.getMigrator().up();

  const app = express();

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [PostResolver],
      validate: false,
    }),
    context: () => ({em: orm.em})
  });

  //create graphql endpoint for us in express
  apolloServer.applyMiddleware({app});

  app.listen(5000, () => {
    console.log('server started at localhost:5000')
  });
}

main();
