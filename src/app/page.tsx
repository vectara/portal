"use client";
import { Box, Flex, Text } from "@chakra-ui/react";
import { Page } from "./components/Page";
import { VectaraLogoLarge } from "./icons/Logo";
import { LoginForm } from "./LoginForm";

const App = () => {
  return (
    <Page pageId="login">
      <Flex
        width="100%"
        height="100%"
        alignItems="center"
        justifyContent={"center"}
        gap=".75rem"
        direction="column"
      >
        {" "}
        <Flex
          direction="column"
          alignItems="center"
          justifyContent="center"
          gap=".5rem"
        >
          <Flex alignItems="center" justifyContent="center" height="164px">
            <Medal />
          </Flex>
          <Box>
            <Text color="#ddd" fontWeight={300} fontSize="3rem">
              PORTAL
            </Text>
          </Box>
        </Flex>
        <LoginForm />
      </Flex>
    </Page>
  );
};

const Medal = () => {
  return (
    <Flex
      border="1px solid #bbb"
      borderRadius="50%"
      overflow="hidden"
      className="vectara-medal"
    >
      <VectaraLogoLarge />
    </Flex>
  );
};

export default App;
