import 'reflect-metadata';
import {MikroORM} from "@mikro-orm/core";
import { __prod__ } from "./constants";
import microConfig from "./mikro-orm.config";
import express from 'express'
import {ApolloServer} from 'apollo-server-express'
import {buildSchema} from 'type-graphql';
import { PostResolver } from "./resolvers/post";
import { UserResolver } from './resolvers/user';

const main = async () => {
  //connect to database
  const orm = await MikroORM.init(microConfig);

  //Run migrations on each server restart
  //Migration is way of getting schemas and creating them within database
  //MikroORM compares the entities with database and may find that post entityy is exactly what it is in database
  //Does not run old migrations - mikroORM makes own table in postgresSQL and keeps track of which migration has run and has not run
  orm.getMigrator().up();

  const app = express();

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [PostResolver, UserResolver],
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
