import { Box, Fade, Flex, Text } from "@chakra-ui/react";
import { CSSProperties } from "react";
import { Spinner } from "./Spinner";

export const LoadingMessage = ({ show }: { show: boolean }) => (
  <Fade in={show}>
    <Flex
      alignItems="center"
      direction="column"
      height="100px"
      justifyContent="center"
      left="calc(50% - 50px)"
      position="absolute"
      top="calc(50% - 50px)"
      width="100px"
    >
      <Spinner />
      <Box textAlign="center">
        <Text fontSize=".9rem" fontWeight="700" color="#777">
          LOADING
        </Text>
      </Box>
    </Flex>
  </Fade>
);
