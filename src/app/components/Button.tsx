import { Button as ChakraButton } from "@chakra-ui/react";
import { ReactNode } from "react";

interface ButtonProps {
  label: string;
  icon: ReactNode;
  onClick: () => void;
}

export const Button = ({ label, icon, onClick }: ButtonProps) => {
  return (
    <ChakraButton
      size="xs"
      display="flex"
      border="1px solid #888"
      backgroundColor="#242424"
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
