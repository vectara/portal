import { Flex } from "@chakra-ui/react";
import { ReactNode } from "react";

export const Centered = ({ children }: { children: ReactNode }) => (
  <Flex h="100%" w="100%" align="center" justify="center">
    {" "}
    {children}
  </Flex>
);
