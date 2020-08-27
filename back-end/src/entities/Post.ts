//Corresponds to the database tables to be stored in PostgresSQL.
//The entities, primary key and properties are needed to ensure mikroorm runs correct CREATE TABLE statment
import { Entity, PrimaryKey, Property } from "@mikro-orm/core";

//Need to convert this mikroORM entity/class into a GraphQL type as well which is needed for GraphQL CRUD operations
//"Field" exposes that attribute to the graphQL schema so you can access this. Dont include if you do not want attributes to be accessible (eg. passwords).
//"Field" allows you to control which parts of the database you want exposed and accessible
import { ObjectType, Field, Int } from "type-graphql";

@ObjectType()
@Entity()
export class Post {
  @Field(() => Int)
  @PrimaryKey()
  id!: number;

  @Field(() => String)
  //you put in types so that when migration occurs, the sql statement ensures the property is of this type
  @Property({type: "date"})
  createdAt = new Date();

  @Field(() => String)
  //you put in types so that when migration occurs, the sql statement ensures the property is of this type
  @Property({type: 'date', onUpdate: () => new Date() })
  updatedAt = new Date();

  @Field(() => String)
  //you put in types so that when migration occurs, the sql statement ensures the property is of this type
  @Property({type: 'text'})
  title!: string;
}

//these type statments are to ensure that when running migration, it creates appropriate sql statements