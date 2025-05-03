import { Input as ChakraInput, InputProps as ChakraInputProps } from "@chakra-ui/react"
import * as React from "react"

export interface InputProps extends ChakraInputProps {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  function Input(props, ref) {
    return (
      <ChakraInput
        ref={ref}
        pl={3}
        bg="button.filter.bg"
        color="button.filter.textColor"
        borderRadius="full"
        h="50px"
        boxShadow="card"
        backdropFilter="blur(5px)"
        transition="all 0.2s ease"
        _hover={{ bg: "button.filter.hoverBg" }}
        _focus={{
          bg: "button.filter.hoverBg",
          boxShadow: "elevated",
          borderColor: "transparent"
        }}
        border="none"
        {...props}
      />
    )
  }
)
