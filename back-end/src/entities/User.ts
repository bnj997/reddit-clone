//Corresponds to the database tables to be stored in PostgresSQL.
//The entities, primary key and properties are needed to ensure mikroorm runs correct CREATE TABLE statment
import { Entity, PrimaryKey, Property } from "@mikro-orm/core";

//Need to convert this mikroORM entity/class into a GraphQL type as well which is needed for GraphQL CRUD operations
//"Field" exposes that attribute to the graphQL schema so you can access this. Dont include if you do not want attributes to be accessible (eg. passwords).
//"Field" allows you to control which parts of the database you want exposed and accessible
import { ObjectType, Field} from "type-graphql";

@ObjectType()
@Entity()
export class User {
  @Field()
  @PrimaryKey()
  id!: number;

  @Field(() => String)
  @Property({type: "date"})
  createdAt = new Date();

  @Field(() => String)
  @Property({type: 'date', onUpdate: () => new Date() })
  updatedAt = new Date();

  @Field(() => String)
  //only want one person to have username. No one allowed to have duplicate
  @Property({type: 'text', unique: true})
  username!: string;

  //no field here because it is just database column - you cant query it/select it
  @Property({type: 'text' })
  password!: string;
}