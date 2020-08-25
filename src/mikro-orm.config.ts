import { Post } from "./entities/Post";
import { __prod__ } from "./constants";
import { MikroORM } from "@mikro-orm/core";
import path from 'path'

export default {
  migrations: {
    path: path.join(__dirname, "./migrations"),  //ensure using right path and will create absolute path so doesnt matter where file is)
    pattern: /^[\w-]+\d+\.[tj]s$/,
  },
  password: 'postgres',
  entities: [Post],
  dbName: "lireddit",
  type: 'postgresql',
  debug: !__prod__,
} as Parameters<typeof MikroORM.init>[0];

//cast as Parameters typeof MicroOrm.init[0] to convert type from string to "lireddit" and "postgresql"
//Ensures that we get the type that init expects in the index.ts