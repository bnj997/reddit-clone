import { InputType, Field } from "type-graphql";
// Input types are used for arguments
@InputType()
export class UsernamePasswordInput {
  @Field(() => String)
  username: string;
  @Field(() => String)
  email: string;
  @Field(() => String)
  password: string;
}
