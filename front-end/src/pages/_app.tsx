import { ThemeProvider, CSSReset, ColorModeProvider } from '@chakra-ui/core'
import { Provider, createClient, dedupExchange, fetchExchange} from 'urql'
import { cacheExchange, Cache, QueryInput } from '@urql/exchange-graphcache';
import theme from '../theme'
import { GetCurrentUserDocument, GetCurrentUserQuery, LoginMutation, RegisterMutation, LogoutMutation } from '../generated/graphql';

function betterUpdateQuery<Result, Query>(
  cache: Cache,
  qi: QueryInput,
  result: any,
  fn: (r: Result, q: Query) => Query
) {
  return cache.updateQuery(qi, (data) => fn(result, data as any) as any);
}

const client = createClient({
  url: "http://localhost:4000/graphql",
  fetchOptions: {
    credentials: "include",
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
    fetchExchange,
  ],
});

function MyApp({ Component, pageProps }) {
  return (
    <Provider value={client}>
      <ThemeProvider theme={theme}>
        <ColorModeProvider>
          <CSSReset />
          <Component {...pageProps} />
        </ColorModeProvider>
      </ThemeProvider>
    </Provider>
  )
}

export default MyApp
