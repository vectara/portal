"use client";
import { Box, Flex, Text } from "@chakra-ui/react";
import { Page } from "./components/Page";
import { VectaraLogoLarge } from "./icons/Logo";
import { LoginForm } from "./LoginForm";
import Link from "next/link";

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
        <Flex direction="column" color="#ddd" alignItems="center" gap=".2rem">
          <Text fontSize=".85rem">or</Text>
          <Link href="/signup">
            <Text fontWeight={500} fontSize=".9">
              Sign Up
            </Text>
          </Link>
        </Flex>
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
