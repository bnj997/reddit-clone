import { MiddlewareFn } from "type-graphql";
import { MyContext } from "src/types";

//middlewarefn basically runs before your resolver
export const isAuth: MiddlewareFn<MyContext> = ({context}, next) => {
  if (!context.req.session.userId) {
    throw new Error("Not authenticated");
  }

  //if pass, just run the resolver/next middleware
  return next();
};