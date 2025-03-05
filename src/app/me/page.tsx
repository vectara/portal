"use client";

import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Switch,
  Link,
  Text,
  useToast,
} from "@chakra-ui/react";
import { Page } from "../components/Page";
import { CSSProperties, ChangeEvent, useEffect, useState } from "react";
import { useUser } from "../hooks/useUser";
import { UserGroups } from "./UserGroups";
import * as amplitude from '@amplitude/analytics-browser';
import { ACTION_SAVE_PROFILE, NAVIGATE_PROFILE } from "../analytics";
import { QuestionIcon } from "@chakra-ui/icons";

const Profile = () => {
  return (
    <Page pageId="profile" accessPrerequisites={{ loggedInUser: true }}>
      <Flex padding="2rem" w="100%">
        <Flex direction="column" gap="1.25rem" style={panelStyles}>
          <Heading
            size="lg"
            fontWeight={400}
            color="#ddd"
            style={{ fontFamily: "Montserrat" }}
          >
            Your Profile
          </Heading>
          <Content />
        </Flex>
      </Flex>
    </Page>
  );
};

const panelStyles = {
  backgroundColor: "#242424",
  borderRadius: "1rem",
  padding: "2rem 2.5rem",
  border: "1px solid #555",
  color: "#ddd",
  overflow: "auto",
  width: "100%",
};

interface FormState {
  vectaraPersonalApiKey?: string;
  pendingUserEmailsToAdd?: Array<string>;
  userEmailToAdd?: string;
  vectaraCustomerId?: string;
}

interface FormErrors {
  vectaraPersonalApiKey: boolean;
  userEmailToAdd: boolean;

}

const INITIAL_FORM_STATE: FormState = {
  vectaraPersonalApiKey: undefined,
  pendingUserEmailsToAdd: undefined,
  userEmailToAdd: undefined,
  vectaraCustomerId: undefined
};

const INITIAL_FORM_ERRORS: FormErrors = {
  vectaraPersonalApiKey: false,
  userEmailToAdd: false,
};

const Content = () => {
  const [formState, setFormState] = useState<FormState>(INITIAL_FORM_STATE);
  const { currentUser, updateUser } = useUser();
  const [isSubmitDisabled, setIsSubmitedDisabled] = useState<boolean>(true);
  const toast = useToast();

  useEffect(() => {
    amplitude.track(NAVIGATE_PROFILE);
  }, []);

  useEffect(() => {
    if (!currentUser) {
      return;
    }

    setFormState({
      ...INITIAL_FORM_STATE,
      vectaraPersonalApiKey: currentUser.vectaraPersonalApiKey ?? undefined,
      vectaraCustomerId: currentUser.vectaraCustomerId ?? undefined
    });
  }, [currentUser]);

  const onSubmit = async () => {
    if (!currentUser) return;

    setIsSubmitedDisabled(true);

    await updateUser(
      formState.vectaraCustomerId,
      formState.vectaraPersonalApiKey,
      formState.pendingUserEmailsToAdd
    );

    amplitude.track(ACTION_SAVE_PROFILE);

    toast({
      status: "success",
      title: "Profile Updated!",
      duration: 3000,
      position: "top",
    });
  };

  if (!currentUser) {
    return null;
  }

  return (
    <Flex as="form" direction="column" gap="1.5rem">
      <Flex direction="column" gap="1rem" mt={1}>
        <Heading size="md">Personal Details</Heading>
        <Box>
          <FormControl style={formControlStyles}>
            <FormLabel style={formLabelStyles}>Email</FormLabel>
            <Input
              type="text"
              value={currentUser?.email ?? ""}
              onChange={() => {}}
              border="1px solid #888"
              width="320px"
              isDisabled={true}
            />
          </FormControl>
        </Box>
      </Flex>
      <Flex direction="column" gap="1rem" mt={3}>
        <Heading size="md">Vectara Credentials</Heading>
        <Box>
          <Text fontSize="xs" color="#FEFCBF" fontWeight={600}>
            Don't have a Vectara account?{" "}
            <Link color="blue.500" href="https://console.vectara.com/signup/?utm_source=App&utm_medium=Portal&utm_term=sign-up&utm_content=sign-up-in-portal&utm_campaign=App-Portal-sign-up-sign-up-in-portal">
              Sign up here.
            </Link>
          </Text>
        </Box>
        <Flex gap="1rem">
          <Box>
            <FormControl style={formControlStyles}>
              <FormLabel style={formLabelStyles}>Vectara Customer ID</FormLabel>
              <Input
                type="text"
                value={formState.vectaraCustomerId ?? ""}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  setFormState({
                    ...formState,
                    vectaraCustomerId: e.target.value ?? undefined,
                  });

                  setIsSubmitedDisabled(false);
                }}
                border="1px solid #888"
                minWidth="320px"
              />
            </FormControl>
          </Box>
          <Box>
            <FormControl style={formControlStyles}>
              <Flex gap={2} alignItems={"center"}>
                <FormLabel style={formLabelStyles}>
                  Vectara Personal API Key
                </FormLabel>
                <Link
                  href="https://docs.vectara.com/docs/console-ui/personal-api-key"
                  target="_blank"
                >
                  <QuestionIcon marginBottom="0.75rem" />
                </Link>
              </Flex>
              <Input
                type="password"
                value={formState.vectaraPersonalApiKey ?? ""}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  setFormState({
                    ...formState,
                    vectaraPersonalApiKey: e.target.value ?? undefined,
                  });

                  setIsSubmitedDisabled(false);
                }}
                border="1px solid #888"
                minWidth="320px"
              />
            </FormControl>
          </Box>
        </Flex>
      </Flex>
      <UserGroups userId={currentUser.id} />
      <Flex>
        <FormControl style={formControlStyles} w="initial">
          <Button
            colorScheme="blue"
            isDisabled={isSubmitDisabled}
            onClick={onSubmit}
          >
            Save
          </Button>
        </FormControl>
      </Flex>
    </Flex>
  );
};

// TODO: Create common components with prop-based styles
const formLabelStyles = {
  fontWeight: "400",
  margin: 0,
  marginBottom: "0.75rem",
};

const formControlStyles = {
  display: "flex",
  flexDirection: "column",
} as CSSProperties;

export default Profile;
