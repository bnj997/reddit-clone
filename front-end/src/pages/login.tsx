import React from 'react'
import { Formik, Form } from 'formik'
import { Box, Button, Link, Flex } from '@chakra-ui/core';
import { Wrapper } from '../components/Wrapper';
import { InputField } from '../components/InputField';
import { useLoginMutation } from '../generated/graphql';
import { toErrorMap } from '../utils/toErrorMap';
import { useRouter } from "next/router"
import { withUrqlClient } from 'next-urql';
import { createUrqlClient } from '../utils/createUrqlClient';
import NextLink from 'next/link' 


//In nextjs, name of file becomes a route which you can search with url
const Login: React.FC<{}> = ({}) => {
  const router = useRouter();
  const [, loginUser] = useLoginMutation();
  return (
    <Wrapper variant="small">
      <Formik 
        initialValues={{usernameOrEmail: "", password: ""}}
        onSubmit={async (values, {setErrors}) => {
          const response = await loginUser(values)
          if (response.data?.loginUser.errors) {
            setErrors(toErrorMap(response.data.loginUser.errors))
          } else if (response.data?.loginUser.user) {
            //once logged in, check if the query in URL corresponds to a page and go there once done
            if (typeof router.query.next === "string") {
              router.push(router.query.next);
            } else {
              // if no query, just go back to home page
              router.push("/");
            }
          }
        }}
      >
        {({isSubmitting}) => (
          <Form>
            <InputField
              name="usernameOrEmail"
              placeholder="username or email"
              label="Username or Email"
            />
            <Box mt={4} >
              <InputField
                name="password"
                placeholder="password"
                label="Password"
                type="password"
              />
            </Box>
            <Flex mt={2}>
              <Box>
                <NextLink href="/forgot-password">
                  <Link ml="auto"> Forgot Password </Link>
                </NextLink>
              </Box>
            </Flex>
            <Button 
              mt={4}
              type="submit"
              isLoading={isSubmitting}
              variantColor="teal"
            >
              Login
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
}

//we do not have dynamic content so no need to server side render
//still need urqlclient since we have mutations
export default withUrqlClient(createUrqlClient)(Login);