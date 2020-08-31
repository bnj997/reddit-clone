import { Box } from '@chakra-ui/core';

//Interface is where you can dictate which props can be passed in to prevent random props being passed in
interface WrapperProps {
  //variant? just in case no prop is passed so you declare a default version
  variant?: 'small' | 'regular'
}

export const Wrapper: React.FC<WrapperProps> = ({ 
  children, 
  variant = 'regular', 
}) => {
  return (
    <Box 
      mt={8} 
      mx="auto" 
      maxW={variant === 'regular' ? "800px" : "400px"} 
      w="100%"
    >
      {children}
    </Box>
  )
};