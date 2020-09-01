import { dedupExchange, fetchExchange, Exchange, stringifyVariables } from "urql";
import { Cache, QueryInput, cacheExchange, Resolver,  } from "@urql/exchange-graphcache"
import { LogoutMutation, GetCurrentUserQuery, GetCurrentUserDocument, LoginMutation, RegisterMutation } from "../generated/graphql";
import { pipe, tap } from "wonka";
import Router from "next/router";

function betterUpdateQuery<Result, Query>(
  cache: Cache,
  qi: QueryInput,
  result: any,
  fn: (r: Result, q: Query) => Query
) {
  return cache.updateQuery(qi, (data) => fn(result, data as any) as any);
}

//allow us to catch all errors
const errorExchange: Exchange = ({ forward }) => (ops$) => {
  return pipe(
    forward(ops$),
    tap(({ error }) => {
      if (error?.message.includes("not authenticated")) {
        //outside of react so using "Router" not const router
        Router.replace("/login");
      }
    })
  );
};

//aka. Just reading data from the cache and returning it
const cursorPagination = (): Resolver => {
  return (_parent, fieldArgs, cache, info) => {
    const { parentKey: entityKey, fieldName } = info;
   
    //gets all the queires that is currently in the cache
    //but there could be other queries we dont care about
    const allFields = cache.inspectFields(entityKey);

    //Make sure we are getting field info from the query of choice
    const fieldInfos = allFields.filter(info => info.fieldName === fieldName);
    const size = fieldInfos.length;
    //return undefined if no data
    if (size === 0) {
      return undefined;
    }

    //stores the results the cache knows and compile a list
    const fieldKey =  `${fieldName}(${stringifyVariables(fieldArgs)})`;
    const isItInCache = cache.resolveFieldByKey(entityKey, fieldKey);
    //if not in cache, we get a partial return
    info.partial = !isItInCache;
    
    //when load more, we want to combile the data
    const results: string[] = [];
    fieldInfos.forEach(fi => {
      const data = cache.resolveFieldByKey(entityKey, fi.fieldKey) as string[];
      results.push(...data);
    })

    return results;
    



    // const visited = new Set();
    // let result: NullArray<string> = [];
    // let prevOffset: number | null = null;

    // for (let i = 0; i < size; i++) {
    //   const { fieldKey, arguments: args } = fieldInfos[i];
    //   if (args === null || !compareArgs(fieldArgs, args)) {
    //     continue;
    //   }

    //   const links = cache.resolveFieldByKey(entityKey, fieldKey) as string[];
    //   const currentOffset = args[offsetArgument];

    //   if (
    //     links === null ||
    //     links.length === 0 ||
    //     typeof currentOffset !== 'number'
    //   ) {
    //     continue;
    //   }

    //   if (!prevOffset || currentOffset > prevOffset) {
    //     for (let j = 0; j < links.length; j++) {
    //       const link = links[j];
    //       if (visited.has(link)) continue;
    //       result.push(link);
    //       visited.add(link);
    //     }
    //   } else {
    //     const tempResult: NullArray<string> = [];
    //     for (let j = 0; j < links.length; j++) {
    //       const link = links[j];
    //       if (visited.has(link)) continue;
    //       tempResult.push(link);
    //       visited.add(link);
    //     }
    //     result = [...tempResult, ...result];
    //   }

    //   prevOffset = currentOffset;
    // }

    // const hasCurrentPage = cache.resolve(entityKey, fieldName, fieldArgs);
    // if (hasCurrentPage) {
    //   return result;
    // } else if (!(info as any).store.schema) {
    //   return undefined;
    // } else {
    //   info.partial = true;
    //   return result;
    // }
  };
};


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
      //run whenever query for get all posts are run
      //want to run cursor pagination when we get all posts
      resolvers: {
        Query: {
          getAllPosts: cursorPagination(),
        },
      },
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
    errorExchange,
    //determines whether you want to serverside render or not
    ssrExchange,
    //responsible for sending queiry/mutations to graphQL api using getch
    fetchExchange,
  ],
});