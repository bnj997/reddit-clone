//Corresponds to the database tables to be stored in PostgresSQL.
//The entities, primary key and properties are needed to ensure mikroorm runs correct CREATE TABLE statment
import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn, CreateDateColumn, BaseEntity, OneToMany} from "typeorm";

//Need to convert this mikroORM entity/class into a GraphQL type as well which is needed for GraphQL CRUD operations
//"Field" exposes that attribute to the graphQL schema so you can access this. Dont include if you do not want attributes to be accessible (eg. passwords).
//"Field" allows you to control which parts of the database you want exposed and accessible
import { ObjectType, Field} from "type-graphql";
import { Post } from "./Post";

@ObjectType()
@Entity()
export class User extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn()
  id!: number;

  @Field(() => String)
  //only want one person to have username. No one allowed to have duplicate
  @Column({ unique: true })
  username!: string;

  @Field(() => String)
  //only want one person to have username. No one allowed to have duplicate
  @Column({ unique: true })
  email!: string;

  //no field here because it is just database column - you cant query it/select it
  @Column()
  password!: string;

  @OneToMany(() => Post, post => post.creator)
  posts: Post[]

  @Field(() => String)
  @CreateDateColumn()
  createdAt = Date();

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt = new Date();
}