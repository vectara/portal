import { Flex } from "@chakra-ui/react";
import { ReactNode } from "react";

export const PortalWrapper = ({ children }: { children: ReactNode }) => {
  return (
    <Flex
      alignItems="center"
      color="#ddd"
      direction="column"
      height="100%"
      justifyContent="center"
      padding="1rem"
      width="100%"
      gap={4}
    >
      {children}
    </Flex>
  );
};
