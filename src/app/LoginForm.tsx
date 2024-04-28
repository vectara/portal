import { Box, Button, Flex, FormControl } from "@chakra-ui/react";
import { Page } from "./components/Page";
import { CSSProperties } from "react";
import { Centered } from "./components/Centered";
import { useUser } from "./hooks/useUser";
import { useRouter } from "next/navigation";

const Login = () => (
  <Page pageId="login">
    <Centered>
      <LoginForm />
    </Centered>
  </Page>
);

export const LoginForm = () => {
  const { currentUser } = useUser();
  const router = useRouter();

  if (currentUser) {
    router.push("/portals");
  }

  return (
    <Flex style={formStyles} direction="column" align="center" gap="2rem">
      <Flex as="form" direction="column" gap="1rem">
        <Box>
          <FormControl style={formControlStyles}>
            <Button
              as="a"
              href="/api/auth/login"
              variant="outline"
              color="#ddd"
              fontWeight={300}
              _hover={{
                backgroundColor: "#777",
              }}
            >
              Log in
            </Button>
          </FormControl>
        </Box>
      </Flex>
    </Flex>
  );
};

// TODO: Use common form components
const formStyles = {
  color: "#ddd",
  fontWeight: "400",
  maxWidth: "640px",
};

const formControlStyles = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
} as CSSProperties;

export default Login;
