import React from 'react'
import { Box, Flex, Link, Button } from '@chakra-ui/core';
import NextLink from "next/link";
import { useGetCurrentUserQuery } from "../generated/graphql"

interface NavBarProps {

}

export const NavBar: React.FC<NavBarProps> = ({}) => {
  const [{data, fetching}] = useGetCurrentUserQuery()
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
        <Button variant="link">Logout</Button>
      </Flex>
    )
  }
  return (
    <Flex bg='tomato' p={4}>
      <Box ml={"auto"}>
        {body}
      </Box>
    </Flex>
  );
}