import React from 'react'
import {Formik, Form} from 'formik'
import { Box, Button } from '@chakra-ui/core';
import { Wrapper } from '../components/Wrapper';
import { InputField } from '../components/InputField';
import { useRegisterMutation } from '../generated/graphql';
import { toErrorMap } from '../utils/toErrorMap';
import { useRouter } from "next/router"
import { createUrqlClient } from '../utils/createUrqlClient';
import { withUrqlClient } from 'next-urql/dist/types/with-urql-client';

interface registerProps {}

//In nextjs, name of file becomes a route which you can search with url
const Register: React.FC<registerProps> = ({}) => {
  const router = useRouter();
  const [, registerUser] = useRegisterMutation();
  return (
    <Wrapper variant="small">
      <Formik 
        initialValues={{username: "", password: ""}}
        onSubmit={async (values, {setErrors}) => {
          const response = await registerUser(values)
          if (response.data?.registerUser.errors) {
            setErrors(toErrorMap(response.data.registerUser.errors))
          } else if (response.data?.registerUser.user) {
            router.push('/')
          }
        }}
      >
        {({isSubmitting}) => (
          <Form>
            <InputField
              name="username"
              placeholder="username"
              label="Username"
            />
            <Box mt={4} >
              <InputField
                name="password"
                placeholder="password"
                label="Password"
                type="password"
              />
            </Box>
            <Button 
              mt={4}
              type="submit"
              isLoading={isSubmitting}
              variantColor="teal"
            >
              Register
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );;
}

export default  withUrqlClient(createUrqlClient)(Register)