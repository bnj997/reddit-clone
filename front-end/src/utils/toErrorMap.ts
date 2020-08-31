import { FieldError } from "../generated/graphql";

//Will take error of type FieldError which is the graphql error generated
export const toErrorMap = (errors: FieldError[]) => {
  const errorMap: Record<string, string> = {};
  errors.forEach(({field, message}) => {
    errorMap[field] = message
  })

  return errorMap
}