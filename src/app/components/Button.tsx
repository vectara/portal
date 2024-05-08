import { Button as ChakraButton, ResponsiveValue } from "@chakra-ui/react";
import { ReactNode } from "react";

interface ButtonProps {
  label?: string;
  size?: ResponsiveValue<string>;
  hasBorder?: boolean;
  icon: ReactNode;
  onClick: () => void;
}

export const Button = ({
  label,
  icon,
  onClick,
  hasBorder = true,
  size = "xs",
}: ButtonProps) => {
  return (
    <ChakraButton
      size={size}
      display="flex"
      border={hasBorder ? "1px solid #888" : undefined}
      backgroundColor="#242424"
      padding=".25rem"
      fontWeight={500}
      color="#ddd"
      gap=".25rem"
      _hover={{
        backgroundColor: "#464646",
      }}
      onClick={onClick}
    >
      {icon} {label}
    </ChakraButton>
  );
};
