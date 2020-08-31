//Corresponds to the database tables to be stored in PostgresSQL.
//The entities, primary key and properties are needed to ensure mikroorm runs correct CREATE TABLE statment
import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn, CreateDateColumn, BaseEntity, ManyToOne} from "typeorm";

//Need to convert this mikroORM entity/class into a GraphQL type as well which is needed for GraphQL CRUD operations
//"Field" exposes that attribute to the graphQL schema so you can access this. Dont include if you do not want attributes to be accessible (eg. passwords).
//"Field" allows you to control which parts of the database you want exposed and accessible
import { ObjectType, Field, Int } from "type-graphql";
import { User } from "./User";

@ObjectType()
@Entity()
export class Post extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id!: number;

  @Field(() => String)
  //you put in types so that when migration occurs, the sql statement ensures the property is of this type
  @Column()
  title!: string;

  @Field(() => String)
  @Column()
  text!: string;

  @Field(() => Int)
  @Column({type: 'int', default: 0})
  points!: number;

  @Field(() => Int)
  @Column()
  creatorId: number;
  @ManyToOne(() => User, user => user.posts)
  creator: User;

  @Field(() => String)
  //you put in types so that when migration occurs, the sql statement ensures the property is of this type
  @CreateDateColumn()
  createdAt = Date;

  @Field(() => String)
  //you put in types so that when migration occurs, the sql statement ensures the property is of this type
  @UpdateDateColumn()
  updatedAt = new Date();
}



//these type statments are to ensure that when running migration, it creates appropriate sql statements