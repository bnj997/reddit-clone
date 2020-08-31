import React, { useState } from 'react'
import { NextPage } from 'next';
import { Wrapper } from '../../components/Wrapper';
import { Formik, Form } from 'formik';
import { InputField } from '../../components/InputField';
import { Button, Box, Link } from '@chakra-ui/core';
import { useChangePasswordMutation } from '../../generated/graphql';
import { useRouter } from 'next/router';
import { toErrorMap } from '../../utils/toErrorMap';
import { withUrqlClient } from 'next-urql';
import { createUrqlClient } from '../../utils/createUrqlClient';
import NextLink from 'next/link'



export const ChangePassword: NextPage<{token: string}> = ({token}) => {
  const router = useRouter();
  const [,changePassword] = useChangePasswordMutation()
  const [tokenError, setTokenError] = useState(''); 
  return (
    <Wrapper variant="small">
      <Formik 
        initialValues={{newPassword: ''}}
        onSubmit={async (values, {setErrors}) => {
          const response = await changePassword({
            newPassword: values.newPassword, 
            token,
          });

          if (response.data?.changePassword.errors) {
            const errorMap = toErrorMap(response.data.changePassword.errors)
            if ('token' in errorMap) {  
              setTokenError(errorMap.token)
            } 
            setErrors(errorMap)
          } else if (response.data?.changePassword.user) {
            router.push('/')
          }
        }}
      >
        {({isSubmitting}) => (
          <Form>
            <InputField
              name="newPassword"
              placeholder="new password"
              label="New Password"
              type="password"
            />
            {tokenError ? (
              <Box>
                <Box style={{color: "red"}}>{tokenError}</Box>
                <NextLink href="/forgot-password">
                  <Link> Please press forgot password again </Link>
                </NextLink>
              </Box>
            ) : null}
            <Button 
              mt={4}
              type="submit"
              isLoading={isSubmitting}
              variantColor="teal"
            >
              Change Password
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
}

//Special function from nextjs that allows us to get any query parameters passed into this component
ChangePassword.getInitialProps = ({query}) => {  
  return {
    token: query.token as string
  }
}

export default withUrqlClient(createUrqlClient)(ChangePassword);