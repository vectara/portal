import { Flex } from "@chakra-ui/react";
import { ReactNode } from "react";

export const PortalPanel = ({
  customPadding,
  children,
}: {
  customPadding?: string;
  children: ReactNode;
}) => {
  return (
    <Flex
      alignItems="center"
      backgroundColor="#242424"
      border="1px solid #555"
      borderRadius=".5rem"
      direction="column"
      gap="1.25rem"
      height="100%"
      padding={customPadding ?? "1.5rem 1rem"}
      width="100%"
    >
      {children}
    </Flex>
  );
};
