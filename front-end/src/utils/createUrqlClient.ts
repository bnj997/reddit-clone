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


export const createUrqlClient = (ssrExchange: any) => ({
  //this url corresponds to our GraphQL API Server
  url: "http://localhost:4000/graphql",
  fetchOptions: {
    credentials: "include" as const,
  },
  exchanges: [
    dedupExchange,
    cacheExchange({
      updates: {
        Mutation: {
          logoutUser: (_result, args, cache, info) => {
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
    ssrExchange,
    fetchExchange,
  ],
});