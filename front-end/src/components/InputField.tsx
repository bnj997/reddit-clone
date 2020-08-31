import React, { HtmlHTMLAttributes } from 'react'
import { useField } from 'formik';
import { FormControl, FormLabel, Input, FormErrorMessage } from '@chakra-ui/core';

//Want to make type of Inputfield to be  React.InputHTMLAttributes<HTMLInputElement>
//Want custom InputField component to take in props that a regular input field would take
//We include label and name and placeholder because we want all input fields to have this. We omit other things like "type" since not all input fields will have it
type InputFieldProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  name: string;
  placeholder: string;
}

//we celare our InputField will be of type InpuitFieldProps which takes in any field regular field takes and also ensures label, name and placeholder must be included
export const InputField: React.FC<InputFieldProps> = ({
  //Seperating the "label" from "props"
  //"label" and "...props" make up the original props we passed in to this component
  //This is because we dont want the {...props} we pass in <Input> to include "label" since <Input> does not accept a label attribute. 
  //We need the "label" for the <FormLabel> attribute
  label, 
  size: _,
  ...props 
}) => {
  //"props" will contain info we pass in InputField component
  //"field" will contain info about name, onBlur, onChange value, checked and multiple.
  //useField hook involves passing in the props and using the value of those props as fields
  const [field, { error }] = useField(props);
  return (
    //!! converts error pf type string to a boolean
    //empty string is a false while a string with values is true
    <FormControl isInvalid={!!error}>
      <FormLabel htmlFor={field.name}>{label}</FormLabel>
      <Input 
        //"...field" contains the values for "name" and "value", "onBlur" and  "onChange"
        {...field}
        //"...props" contains the value for ALL THE ATTRIBUTES (except label and size) you passed in within the component.
        //We include "...props" as it contains the attributes that the "...field" variable does not capture like "type" which we need to hide password
        //Note that "...props" contains reference to "name" just like "...field" so bit of duplication there.
        {...props}
        //"id" was not defined in the prop or field so manually including it here.
        id={field.name}
      />
      {error ? <FormErrorMessage>{error}</FormErrorMessage> : null}
    </FormControl>
  );
}