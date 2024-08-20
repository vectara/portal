"use client";

import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Select,
  useToast,
} from "@chakra-ui/react";
import { Page } from "../components/Page";
import { CSSProperties, ChangeEvent, useEffect, useState } from "react";
import { useUser } from "../hooks/useUser";
import { UserGroups } from "./UserGroups";

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
  vectaraCustomerId?: string;
  vectaraPersonalApiKey?: string;
  vectaraOAuth2ClientId?: string;
  vectaraOAuth2ClientSecret?: string;
  pendingUserEmailsToAdd?: Array<string>;
  userEmailToAdd?: string;
}

interface FormErrors {
  vectaraCustomerId: boolean;
  vectaraPersonalApiKey: boolean;
  vectaraOAuth2ClientId: boolean;
  vectaraOAuth2ClientSecret: boolean;
  userEmailToAdd: boolean;
}

const INITIAL_FORM_STATE: FormState = {
  vectaraCustomerId: undefined,
  vectaraPersonalApiKey: undefined,
  pendingUserEmailsToAdd: undefined,
  vectaraOAuth2ClientId: undefined,
  vectaraOAuth2ClientSecret: undefined,
  userEmailToAdd: undefined,
};

const INITIAL_FORM_ERRORS: FormErrors = {
  vectaraCustomerId: false,
  vectaraPersonalApiKey: false,
  vectaraOAuth2ClientId: false,
  vectaraOAuth2ClientSecret: false,
  userEmailToAdd: false,
};

const Content = () => {
  const [formState, setFormState] = useState<FormState>(INITIAL_FORM_STATE);
  const { currentUser, updateUser } = useUser();
  const [isSubmitDisabled, setIsSubmitedDisabled] = useState<boolean>(true);
  const toast = useToast();

  useEffect(() => {
    if (!currentUser) {
      return;
    }

    setFormState({
      ...INITIAL_FORM_STATE,
      vectaraCustomerId: currentUser.vectaraCustomerId ?? undefined,
      vectaraPersonalApiKey: currentUser.vectaraPersonalApiKey ?? undefined,
      vectaraOAuth2ClientId: currentUser.vectaraOAuth2ClientId ?? undefined,
      vectaraOAuth2ClientSecret:
        currentUser.vectaraOAuth2ClientSecret ?? undefined,
    });
  }, [currentUser]);

  const onSubmit = async () => {
    if (!currentUser) return;

    setIsSubmitedDisabled(true);

    await updateUser(
      formState.vectaraCustomerId,
      formState.vectaraPersonalApiKey,
      formState.vectaraOAuth2ClientId,
      formState.vectaraOAuth2ClientSecret,
      formState.pendingUserEmailsToAdd
    );

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
      <Flex gap="1rem">
        <Box>
          <FormControl style={formControlStyles}>
            <FormLabel style={formLabelStyles}>Email</FormLabel>
            <Input
              type="text"
              value={currentUser?.email ?? ""}
              onChange={() => {}}
              border="1px solid #888"
              minWidth="320px"
              isDisabled={true}
            />
          </FormControl>
        </Box>
      </Flex>
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
            <FormLabel style={formLabelStyles}>
              Vectara Personal API Key
            </FormLabel>
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
      <Flex gap="1rem">
        <Box>
          <FormControl style={formControlStyles}>
            <FormLabel style={formLabelStyles}>OAuth 2.0 Client ID</FormLabel>
            <Input
              type="password"
              value={formState.vectaraOAuth2ClientId ?? ""}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                setFormState({
                  ...formState,
                  vectaraOAuth2ClientId: e.target.value ?? undefined,
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
            <FormLabel style={formLabelStyles}>
              OAuth 2.0 Client Secret
            </FormLabel>
            <Input
              type="password"
              value={formState.vectaraOAuth2ClientSecret ?? ""}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                setFormState({
                  ...formState,
                  vectaraOAuth2ClientSecret: e.target.value ?? undefined,
                });

                setIsSubmitedDisabled(false);
              }}
              border="1px solid #888"
              minWidth="320px"
            />
          </FormControl>
        </Box>
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
