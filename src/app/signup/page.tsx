"use client";
import {
  Box,
  Button,
  Checkbox,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Input,
  Text,
} from "@chakra-ui/react";
import { Page } from "../components/Page";
import { CSSProperties, useEffect, useRef, useState } from "react";
import { Centered } from "../components/Centered";
import { useUser } from "../hooks/useUser";
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

const Profile = () => (
  <Page pageId="profile">
    <Centered>
      <SignUpForm />
    </Centered>
  </Page>
);

const SignUpForm = () => {
  const [formState, setFormState] = useState<FormState>(INITIAL_FORM_STATE);
  const [formErrors, setFormErrors] = useState<FormErrors>(INITIAL_FORM_ERRORS);
  const didStartFillingForm = useRef<boolean>(false);
  const { currentUser, createUser } = useUser();
  const router = useRouter();

  const validateForm = () => {
    const isEmailValid = String(formState.email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );

    const isPasswordValid =
      formState.password && formState.password.length >= 8;

    const isTosValid = formState.tos;

    return {
      email: !isEmailValid,
      password: !isPasswordValid,
      tos: !isTosValid,
    };
  };

  const onSubmit = () => {
    const validationResult = validateForm();

    if (
      validationResult.email ||
      validationResult.password ||
      validationResult.tos
    ) {
      setFormErrors(validationResult as FormErrors);
      return;
    }

    createUser(formState.email!, formState.password!);
  };

  const onChangeEmail = (e: React.ChangeEvent<HTMLInputElement>) => {
    didStartFillingForm.current = true;
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
    if (formErrors.password) {
      setFormErrors((prev) => ({ ...prev, password: false }));
    }
    const updatedPassword = e.target.value;

    setFormState((prevState) => ({
      ...prevState,
      password: updatedPassword,
    }));
  };

  const onChangeTos = (e: React.ChangeEvent<HTMLInputElement>) => {
    didStartFillingForm.current = true;
    if (formErrors.tos) {
      setFormErrors((prev) => ({ ...prev, tos: false }));
    }
    const updatedTos = e.target.checked;

    setFormState((prevState) => ({
      ...prevState,
      tos: updatedTos,
    }));
  };

  const isSubmitDisabled =
    !didStartFillingForm.current ||
    (didStartFillingForm.current &&
      (!formState.email || !formState.password)) ||
    (didStartFillingForm.current && (formErrors.email || formErrors.password));

  useEffect(() => {
    if (currentUser) {
      router.push("/portals");
    }
  }, [currentUser]);

  return (
    <Flex style={formStyles} direction="column" align="center" gap="2rem">
      <Heading size="md" style={{ fontFamily: "Montserrat" }}>
        Sign Up for Portal
      </Heading>
      <Flex as="form" direction="column" gap="1.5rem">
        <Box>
          <FormControl
            style={formControlStyles}
            isInvalid={formErrors.email}
            onSubmit={onSubmit}
          >
            <FormLabel style={formLabelStyles}>Email</FormLabel>
            <Input
              type="text"
              value={formState.email ?? ""}
              onChange={onChangeEmail}
              border="1px solid #888"
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
            <FormLabel style={formLabelStyles}>Password</FormLabel>
            <Input
              type="password"
              value={formState.password ?? ""}
              onChange={onChangePassword}
              border="1px solid #888"
            />
            <FormErrorMessage fontSize="0.75rem">
              Please enter a valid password.
            </FormErrorMessage>
          </FormControl>

          <FormControl style={formControlStyles} isInvalid={formErrors.tos}>
            <Flex alignItems="flex-start" gap=".5rem">
              <Checkbox
                checked={formState.tos}
                onChange={onChangeTos}
                border="1px solid #888"
              />
              <Text fontSize=".75em" maxWidth="200px" textAlign="justify">
                I understand this is a prototype app and that it may be subject
                to various bugs.
              </Text>
            </Flex>
          </FormControl>
        </Flex>
        <Box>
          <FormControl style={formControlStyles}>
            <Button isDisabled={isSubmitDisabled} onClick={onSubmit}>
              Sign up
            </Button>
          </FormControl>
        </Box>
      </Flex>
    </Flex>
  );
};

// TODO: Use common form components
const formLabelStyles = {
  fontWeight: "500",
  margin: 0,
  marginBottom: "0.75rem",
};

const formStyles = {
  backgroundColor: "#242424",
  borderRadius: ".5rem",
  border: "1px solid #888",
  color: "#ddd",

  fontWeight: "400",
  maxWidth: "640px",
  padding: "2.5rem",
};

const formControlStyles = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
} as CSSProperties;

export default Profile;
