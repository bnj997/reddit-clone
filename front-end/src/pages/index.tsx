import { NavBar } from "../components/NavBar";
import { withUrqlClient} from 'next-urql'
import { createUrqlClient } from "../utils/createUrqlClient";
import { useGetAllPostsQuery } from "../generated/graphql"
import { Layout } from "../components/Layout";
import NextLink from 'next/link'
import { Stack, Box, Heading, Text } from "@chakra-ui/core";

const Index = () => {
  const [{data}] = useGetAllPostsQuery({
    variables: {
      limit: 10,
    },
  });
  
  return (
    <Layout>
      <NextLink href="/create-post">
        Create Post
      </NextLink>
      {!data ? (
        <div> Loading...</div>
      ) : (
        <Stack spacing={8}>
          {data.getAllPosts.map((p) => (
            <Box key={p.id} p={5} shadow="md" borderWidth="1px">
              <Heading fontSize="xl">{p.title}</Heading>
              <Text mt={4}>{p.text.slice(0, 50)}...</Text>
            </Box>
          ))}
        </Stack>
      )}
    </Layout>
  )  
}

//ssr true sets up the serverside exchange
//we have dynamic content so want to server side render
//HOW SSR WORKS
// -> client goes on website and makes request to next.js server at locahost:3000
// -> next.js serevr makes graphql request to express server at localhost:4000
// -> the html is built on localhost:4000 and sent back to the browser
//NOTE -> will only SSR once as the page initially loads. eg. if we go to next page and press back button to page which already SSR, client side rendering would happen instead
export default withUrqlClient(createUrqlClient, {ssr: true})(Index);
