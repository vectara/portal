import { Spinner } from "@/app/components/Spinner";
import { Fade, Flex, Text } from "@chakra-ui/react";
import { CSSProperties } from "react";

// TODO: Dedupe with components/LoadingMessage.tsx
export const LoadingMessage = ({ show }: { show: boolean }) => (
  <Fade in={show}>
    <Flex direction="column" style={loadingMessageStyles}>
      <Spinner />
      <Flex
        textAlign="center"
        position="absolute"
        h="100%"
        w="100%"
        alignItems="center"
        justifyContent="center"
      >
        <Text
          fontSize="1rem"
          fontWeight="500"
          color="#ddd"
          letterSpacing=".1rem"
        >
          LOADING
        </Text>
      </Flex>
    </Flex>
  </Fade>
);

const loadingMessageStyles = {
  position: "absolute",
  left: "calc(50% - 100px)",
  top: "calc(50% - 100px)",
} as CSSProperties;
