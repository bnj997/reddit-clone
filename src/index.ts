import {MikroORM} from "@mikro-orm/core";
import { __prod__ } from "./constants";
import { Post } from "./entities/Post";
import microConfig from "./mikro-orm.config";

const main = async () => {
  //connect to database
  const orm = await MikroORM.init(microConfig);
  //run migrations
  orm.getMigrator().up();
  //Run SQL stuff
  // const post = orm.em.create(Post, {title: 'my first post'})
  // await orm.em.persistAndFlush(post)
  // const posts = await orm.em.find(Post, {});
  // console.log(posts)
}

main();
