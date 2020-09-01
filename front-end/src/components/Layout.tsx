import React from 'react'
import { NavBar } from './NavBar'
import { WrapperVariant, Wrapper } from './Wrapper';
import { receiveMessageOnPort } from 'worker_threads';

interface LayoutProps {
  //variant? just in case no prop is passed so you declare a default version
  variant?: WrapperVariant;
}

export const Layout: React.FC<LayoutProps> = ({children, variant}) => {
  return (
    <React.Fragment>
      <NavBar />
      <Wrapper variant={variant}>
        {children}
      </Wrapper>
    </React.Fragment>
  );
}