import React from 'react'
import { Formik, Form } from 'formik';
import { InputField } from '../components/InputField';
import { Box, Button } from '@chakra-ui/core';
import { useCreatePostMutation, useGetCurrentUserQuery } from '../generated/graphql';
import { useRouter } from "next/router";
import { Layout } from '../components/Layout';
import { withUrqlClient } from 'next-urql';
import { createUrqlClient } from '../utils/createUrqlClient';
import { useIsAuth } from '../utils/useIsAuth';


const CreatePost: React.FC<{}> = ({}) => {
  const router = useRouter();
  useIsAuth();
  const [, createPost] = useCreatePostMutation()
  return (
    <Layout variant="small">
      <Formik 
        initialValues={{title: '', text: ''}}
        onSubmit={async (values) => {
          //error is part of error exchange in createUrqlClient
          const {error} = await createPost({input: values});
          if (!error) {
            router.push("/")
          }
        }}
      >
        {({isSubmitting}) => (
          <Form>
            <InputField
              name="title"
              placeholder="title"
              label="Title"
            />
            <Box mt={4} >
              <InputField
                textarea
                name="text"
                placeholder="text"
                label="Body"
              />
            </Box>
            <Button 
              mt={4}
              type="submit"
              isLoading={isSubmitting}
              variantColor="teal"
            >
              Create Post
            </Button>
          </Form>
        )}
      </Formik>
    </Layout>
  );
}

export default withUrqlClient(createUrqlClient)(CreatePost);