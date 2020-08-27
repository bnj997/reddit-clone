//ALL THE CONFIG STUFF YOU NEED TO CONNECT TO POSTGRES DATABASE

import { Post } from "./entities/Post";
import { __prod__ } from "./constants";
import { MikroORM } from "@mikro-orm/core";
import path from 'path'
import { User } from "./entities/User";

export default {
  //Migrations ensure that the schema matches to what is currently in the database and updates it accordingly
  //eg. Running "npx mikro-orm migration:create" will create the entities you listed below using sql
  migrations: {
    //Where the migrations will be stored
    //ensure using right path and will create absolute path so doesnt matter where file is.
    path: path.join(__dirname, "./migrations"),  
    pattern: /^[\w-]+\d+\.[tj]s$/,
  },
  password: 'postgres',
  //database tables
  entities: [Post, User],
  dbName: "lireddit",
  type: 'postgresql',
  debug: !__prod__,
} as Parameters<typeof MikroORM.init>[0];

//cast as Parameters typeof MicroOrm.init[0] to convert type from string to "lireddit" and "postgresql"
//Ensures that the parameter of MikroORM.init() is of the type that MikroORM.init()  expects.