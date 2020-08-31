import React from 'react'
import {Formik, Form} from 'formik'
import { Box, Button } from '@chakra-ui/core';
import { Wrapper } from '../components/Wrapper';
import { InputField } from '../components/InputField';
import { useRegisterMutation } from '../generated/graphql';
import { toErrorMap } from '../utils/toErrorMap';
import { useRouter } from "next/router"
import { createUrqlClient } from '../utils/createUrqlClient';
import { withUrqlClient } from "next-urql";

interface registerProps {}

//In nextjs, name of file becomes a route which you can search with url
//Eg. creating "register.tsx" page will make it accessible via localhost:3000/register
const Register: React.FC<registerProps> = ({}) => {
  const router = useRouter();
  //1st param - information about whats going in mutation such as data, isFetching etc
  //2nd param - is the function that will run the mutation we defined.
  //This hook is generated with codegen and this helps us do 2 things
  // -> auto generates graphql queries/mutations and makes it easy to refer to it using hook (eg. useRegisterMutation) + seperate our graphql queries in seperate files
  // -> provides Types to our response objects so that we can write type-safe code. eg. response.data.registerUser has access to the user + error objects which we defined in mutation
  const [, registerUser] = useRegisterMutation();
  return (
    <Wrapper variant="small">
      <Formik 
        initialValues={{username: "", password: ""}}
        onSubmit={async (values, {setErrors}) => {
          const response = await registerUser(values)
          if (response.data?.registerUser.errors) {
            //Formik handles errors as an array of objects, but we just want to access as a map of key values pairs.
            //the key will be the field, and the value will be the message
            //response.data.registerUser.errors is in form [{field: "username", message: "lenght...greater 2"}]
            //toErrorMap is in form {username: "length....greater 2"}
            setErrors(toErrorMap(response.data.registerUser.errors))
          } else if (response.data?.registerUser.user) {
            //allows us to go to another page via router
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