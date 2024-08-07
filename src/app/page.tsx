"use client";
import { Badge, Box, Flex, Text } from "@chakra-ui/react";
import { Page } from "./components/Page";
import { VectaraLogoLarge } from "./icons/Logo";
import { LoginForm } from "./LoginForm";
import { redirect } from "next/navigation";
import { useUser } from "./hooks/useUser";
import { useEffect } from "react";

const Login = () => {
  const { currentUser } = useUser();

  useEffect(() => {
    if (currentUser) {
      redirect("/portals");
    }
  }, [currentUser]);

  if (currentUser === undefined) {
    return <Page pageId="login" />;
  }

  return (
    <Page pageId="login">
      {/* Display the login form only if we've verified the non-existence of a logged in user. */}
      {currentUser === null && (
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
              <Logo />
            </Flex>
            <Flex direction="column" alignItems="center">
              <Text color="#ddd" fontWeight={300} fontSize="3rem">
                PORTAL
              </Text>
              <Badge
                fontSize=".6rem"
                padding=".125rem .5rem"
                colorScheme="purple"
              >
                beta
              </Badge>
            </Flex>
          </Flex>
          <Box paddingTop="1rem">
            <LoginForm />
          </Box>
        </Flex>
      )}
    </Page>
  );
};

const Logo = () => {
  return (
    <Flex
      border="1px solid #bbb"
      borderRadius="50%"
      overflow="hidden"
      className="vectara-logo"
    >
      <VectaraLogoLarge />
    </Flex>
  );
};

export default Login;
