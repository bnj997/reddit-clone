import React, { useState } from 'react'
import { Wrapper } from '../components/Wrapper';
import { Formik, Form, FormikProvider } from 'formik';
import { toErrorMap } from '../utils/toErrorMap';
import { InputField } from '../components/InputField';
import { Box, Button } from '@chakra-ui/core';
import { withUrqlClient } from 'next-urql';
import { createUrqlClient } from '../utils/createUrqlClient';
import { useForgotPasswordMutation } from "../generated/graphql"

const ForgotPassword: React.FC<{}> = ({}) => {
  const [complete, setComplete] = useState(false);
  const [, forgotPassword] = useForgotPasswordMutation()
  return (
    <Wrapper variant="small">
      <Formik 
        initialValues={{email: ""}}
        onSubmit={async (values)  => {
          await forgotPassword(values);
          setComplete(true);
        }}
      >
        {({isSubmitting}) => 
          complete ? (
            <Box>
              Sent email with forget password link
            </Box>
          ) : (
          <Form>
            <Box mt={4} >
              <InputField
                name="email"
                placeholder="email"
                label="Email"
                type="email"
              />
            </Box>
            <Button 
              mt={4}
              type="submit"
              isLoading={isSubmitting}
              variantColor="teal"
            >
              Forgot Password
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  )
};
export default withUrqlClient(createUrqlClient)(ForgotPassword);