import {
  Box,
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  Input,
} from "@chakra-ui/react";
import { Page } from "./components/Page";
import { CSSProperties, useRef, useState } from "react";
import { Centered } from "./components/Centered";
import { useUser } from "./hooks/useUser";
import { useRouter } from "next/navigation";

interface FormState {
  email?: string;
  password?: string;
  tos?: boolean;
}

interface FormErrors {
  email: boolean;
  password: boolean;
  tos: boolean;
}

const INITIAL_FORM_STATE: FormState = {
  email: undefined,
  password: undefined,
  tos: false,
};

const INITIAL_FORM_ERRORS: FormErrors = {
  email: false,
  password: false,
  tos: false,
};

const Login = () => (
  <Page pageId="signup">
    <Centered>
      <LoginForm />
    </Centered>
  </Page>
);

export const LoginForm = () => {
  const [formState, setFormState] = useState<FormState>(INITIAL_FORM_STATE);
  const [formErrors, setFormErrors] = useState<FormErrors>(INITIAL_FORM_ERRORS);
  const [isInvalidLogin, setIsInvalidLogin] = useState<boolean>(false);
  const didStartFillingForm = useRef<boolean>(false);
  const { loginUser, currentUser } = useUser();
  const router = useRouter();

  if (currentUser) {
    router.push("/portals");
  }

  const validateForm = () => {
    const isEmailValid = String(formState.email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );

    const isPasswordValid =
      formState.password && formState.password.length >= 8;

    return {
      email: !isEmailValid,
      password: !isPasswordValid,
    };
  };

  const onSubmit = async () => {
    const validationResult = validateForm();

    if (validationResult.email || validationResult.password) {
      setFormErrors(validationResult as FormErrors);
      return;
    }

    const loggedInUser = await loginUser(formState.email!, formState.password!);

    if (loggedInUser) {
      const userHasPortalCreationRequirements =
        !!loggedInUser.vectaraCustomerId &&
        !!loggedInUser.vectaraPersonalApiKey;
      router.push(userHasPortalCreationRequirements ? "/portals" : "/me");
    } else {
      setIsInvalidLogin(true);
    }
  };

  const onChangeEmail = (e: React.ChangeEvent<HTMLInputElement>) => {
    didStartFillingForm.current = true;
    setIsInvalidLogin(false);
    if (formErrors.email) {
      setFormErrors((prev) => ({ ...prev, email: false }));
    }
    const updatedEmail = e.target.value;

    setFormState((prevState) => ({
      ...prevState,
      email: updatedEmail,
    }));
  };

  const onChangePassword = (e: React.ChangeEvent<HTMLInputElement>) => {
    didStartFillingForm.current = true;
    setIsInvalidLogin(false);
    if (formErrors.password) {
      setFormErrors((prev) => ({ ...prev, password: false }));
    }
    const updatedPassword = e.target.value;

    setFormState((prevState) => ({
      ...prevState,
      password: updatedPassword,
    }));
  };

  const isSubmitDisabled =
    !didStartFillingForm.current ||
    (didStartFillingForm.current &&
      (!formState.email || !formState.password)) ||
    (didStartFillingForm.current && (formErrors.email || formErrors.password));

  return (
    <Flex style={formStyles} direction="column" align="center" gap="2rem">
      <Flex as="form" direction="column" gap="1rem">
        <Box>
          <FormControl
            style={formControlStyles}
            isInvalid={formErrors.email}
            onSubmit={onSubmit}
          >
            <Input
              type="text"
              value={formState.email ?? ""}
              onChange={onChangeEmail}
              border="1px solid #888"
              placeholder="email"
            />
            <FormErrorMessage fontSize="0.75rem">
              Please enter a valid email.
            </FormErrorMessage>
          </FormControl>
        </Box>
        <Flex direction="column" gap="1rem">
          <FormControl
            style={formControlStyles}
            isInvalid={formErrors.password}
          >
            <Input
              type="password"
              value={formState.password ?? ""}
              onChange={onChangePassword}
              border="1px solid #888"
              placeholder="password"
            />
            <FormErrorMessage fontSize="0.75rem">
              Please enter a valid password.
            </FormErrorMessage>
          </FormControl>
        </Flex>
        <Box>
          <FormControl style={formControlStyles} isInvalid={isInvalidLogin}>
            <FormErrorMessage fontSize="0.75rem" margin="0">
              Wrong email or password
            </FormErrorMessage>
          </FormControl>
        </Box>
        <Box>
          <FormControl style={formControlStyles}>
            <Button isDisabled={isSubmitDisabled} onClick={onSubmit}>
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
