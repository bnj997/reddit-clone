import { dedupExchange, fetchExchange } from "urql";
import { Cache, QueryInput, cacheExchange,  } from "@urql/exchange-graphcache"
import { LogoutMutation, GetCurrentUserQuery, GetCurrentUserDocument, LoginMutation, RegisterMutation } from "../generated/graphql";

function betterUpdateQuery<Result, Query>(
  cache: Cache,
  qi: QueryInput,
  result: any,
  fn: (r: Result, q: Query) => Query
) {
  return cache.updateQuery(qi, (data) => fn(result, data as any) as any);
}


//URQL is a graphql client that can be used to make graphql requests
export const createUrqlClient = (ssrExchange: any) => ({
  //this url corresponds to our GraphQL API Server
  url: "http://localhost:4000/graphql",
  //ensure that cookies can be received from the server and stored on browser when logging in/registering/logging out
  fetchOptions: {
    credentials: "include" as const,
  },
  //Exchanges are small chunks of logic similar to middleware
  exchanges: [
    //keeps track of ongoing operations that haent retuened an operation result
    dedupExchange,
    //By default, urql will avoid sending same request to graphql api repeadtedly by caching result of each query
    //Need to update the cache when logging in or logging out to ensure navbar updates apropriately 
    //Need custom updates to work and need to include the mutations that will include the update
    cacheExchange({
      //Goal of this is to update the current user/fire the get current user query as logout/login/register mutation fires
      updates: {
        Mutation: {
          logoutUser: (_result, args, cache, info) => {
            //better update query to ensure types are enforced
            betterUpdateQuery<LogoutMutation, GetCurrentUserQuery>(
              cache,
              {query: GetCurrentUserDocument},
              _result,
              () => ({getCurrentUser: null})
            )
          },
          loginUser: (_result, args, cache, info) => {
            betterUpdateQuery<LoginMutation, GetCurrentUserQuery>(
              cache,
              { query: GetCurrentUserDocument },
              _result,
              (result, query) => {
                if (result.loginUser.errors) {
                  return query;
                } else {
                  return {
                    //if no error return the current user
                    getCurrentUser: result.loginUser.user,
                  };
                }
              }
            );
          },
          registerUser: (_result, args, cache, info) => {
            betterUpdateQuery<RegisterMutation, GetCurrentUserQuery>(
              cache,
              { query: GetCurrentUserDocument },
              _result,
              (result, query) => {
                if (result.registerUser.errors) {
                  return query;
                } else {
                  return {
                    getCurrentUser: result.registerUser.user,
                  };
                }
              }
            );
          },
        },
      },
    }),
    //determines whether you want to serverside render or not
    ssrExchange,
    //responsible for sending queiry/mutations to graphQL api using getch
    fetchExchange,
  ],
});