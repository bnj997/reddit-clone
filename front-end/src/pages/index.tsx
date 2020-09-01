import { withUrqlClient} from 'next-urql'
import { createUrqlClient } from "../utils/createUrqlClient";
import { useGetAllPostsQuery } from "../generated/graphql"
import { Layout } from "../components/Layout";
import NextLink from 'next/link'
import { Stack, Box, Heading, Text, Flex, Link, Button } from "@chakra-ui/core";
import { useState } from "react";

const Index = () => {
  const [variables, setVariables] = useState({
    limit: 10, 
    //cursor could be null or string
    cursor: null as null | string,
  });
  const [{data, fetching}] = useGetAllPostsQuery({
    variables,
  });

  if (!fetching && !data) {
    return (
      <div>
        Query seemed to have failed
      </div>
    )
  }
  
  return (
    <Layout>
      <Flex align="center">
        <Heading mb={5}>RedditClone</Heading>
        <NextLink href="/create-post">
          <Button variantColor="teal" ml="auto">Create Post</Button>
        </NextLink>
      </Flex>
     
      {!data && fetching ? (
        <div> Loading...</div>
      ) : (
        <Stack spacing={8}>
          {data!.getAllPosts.map((p) => (
            <Box key={p.id} p={5} shadow="md" borderWidth="1px">
              <Heading fontSize="xl">{p.title}</Heading>
              <Text mt={4}>{p.textSnippet}...</Text>
            </Box>
          ))}
        </Stack>
      )}
      {data? (
        <Flex>
          <Button onClick={() => {
            setVariables({
              limit: variables.limit,
              //want to get all items after the last item in initial list
              cursor: data.getAllPosts[data.getAllPosts.length - 1].createdAt,
            })
          }} isLoading = {fetching} variantColor="teal" m="auto" my={8}>
            Load more
          </Button>
        </Flex>
      ) : null}
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
