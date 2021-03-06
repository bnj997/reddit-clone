import React from 'react'
import { Box, Flex, Link, Button } from '@chakra-ui/core';
import NextLink from "next/link";
import { useGetCurrentUserQuery, useLogoutMutation } from "../generated/graphql"
import { isServer } from '../utils/isServer';

interface NavBarProps {}

export const NavBar: React.FC<NavBarProps> = ({}) => {
  //use fetching to show if currently fetching
  //casting fetching to logoutFetching since conflict with "fetching" found in useGetCurrentUserQuery
  //Using uqls useMutation returns 2 things
  // -> first contains {fetching, errors and data}
  // -> second contains the actual query we want to execute
  const [{fetching: logoutFetching} ,logout] = useLogoutMutation();

  //This request should not run when server side rendering of the index page is occuring. It should only occur on client side rendering
  const [{data, fetching}] = useGetCurrentUserQuery({
    pause: isServer(),
  })

  let body = null

  //data is loading
  if (fetching) {
    body = null;
  //user not logged in
  } else if (!data?.getCurrentUser) {
    body = (
      <React.Fragment>
        <NextLink href="/login">
          <Link color='white' mr={2}> Login</Link>
        </NextLink>
        <NextLink href="/register">
          <Link color='white' mr={2}> Register</Link>
        </NextLink>
      </React.Fragment>
    );
  //user is logged in
  } else {
    body = (
      <Flex>
        <Box mr={2}>{data.getCurrentUser.username}</Box>
        <Button onClick={() => {
          logout();
        }} 
        isLoading={logoutFetching}
        variant="link">Logout</Button>
      </Flex>
    )
  }
  return (
    <Flex position="sticky" zIndex={2} top={0} bg='tan' p={4}>
      <Box ml={"auto"}>
        {body}
      </Box>
    </Flex>
  );
}