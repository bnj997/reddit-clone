import React from 'react'
import { Wrapper } from '../components/Wrapper';
import { Formik, Form } from 'formik';
import { toErrorMap } from '../utils/toErrorMap';
import { InputField } from '../components/InputField';
import { Box, Flex, Link, Button } from '@chakra-ui/core';


export const CreatePost: React.FC<{}> = ({}) => {
  return (
    <Wrapper variant="small">
      <Formik 
        initialValues={{usernameOrEmail: "", password: ""}}
        onSubmit={async (values, {setErrors}) => {
          const response = await loginUser(values)
          if (response.data?.loginUser.errors) {
            setErrors(toErrorMap(response.data.loginUser.errors))
          } else if (response.data?.loginUser.user) {
            router.push('/')
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