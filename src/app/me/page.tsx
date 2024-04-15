"use client";

import {
  Box,
  Button,
  Center,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Input,
  Select,
} from "@chakra-ui/react";
import { Page } from "../components/Page";
import { CSSProperties, ChangeEvent, useEffect, useState } from "react";
import { useUser } from "../hooks/useUser";
import { useRouter } from "next/navigation";

const Profile = () => {
  return (
    <Page pageId="profile">
      <Flex padding="2rem" w="100%">
        <Flex direction="column" gap="1.25rem" style={searchPanelStyles}>
          <Heading size="lg">Your Profile</Heading>
          <Content />
        </Flex>
      </Flex>
    </Page>
  );
};

const searchPanelStyles = {
  backgroundColor: "#242424",
  borderRadius: "1rem",
  padding: "3rem 3.5rem",
  border: "1px solid #555",
  color: "#ddd",
  overflow: "auto",
  width: "100%",
};

const inputStyles = {
  border: "1px solid #aaa",
};

interface FormState {
  vectaraCustomerId?: string;
  vectaraPersonalApiKey?: string;
  pendingUserEmailsToAdd?: Array<string>;
  userEmailToAdd?: string;
}

interface FormErrors {
  vectaraCustomerId: boolean;
  vectaraPersonalApiKey: boolean;
  userEmailToAdd: boolean;
}

const INITIAL_FORM_STATE: FormState = {
  vectaraCustomerId: undefined,
  vectaraPersonalApiKey: undefined,
  pendingUserEmailsToAdd: undefined,
  userEmailToAdd: undefined,
};

const INITIAL_FORM_ERRORS: FormErrors = {
  vectaraCustomerId: false,
  vectaraPersonalApiKey: false,
  userEmailToAdd: false,
};

const Content = () => {
  const [formState, setFormState] = useState<FormState>(INITIAL_FORM_STATE);
  const [formErrors, setFormErrors] = useState<FormErrors>(INITIAL_FORM_ERRORS);
  const [currentChildUserEmails, setCurrentChildUserEmails] = useState<
    Array<string>
  >([]);
  const { currentUser, updateUser, getChildUsersIds } = useUser();
  const router = useRouter();
  const isSubmitDisabled = false;

  useEffect(() => {
    const doAsync = async () => {
      const res = await getChildUsersIds();
      setCurrentChildUserEmails(res.users.map((u: any) => u.email));
    };
    doAsync();
  }, []);

  useEffect(() => {
    if (!currentUser) {
      router.push("/vectara-portal");
      return;
    }

    setFormState({
      ...INITIAL_FORM_STATE,
      vectaraCustomerId: currentUser.vectaraCustomerId ?? undefined,
      vectaraPersonalApiKey: currentUser.vectaraPersonalApiKey ?? undefined,
    });
  }, [currentUser]);

  const onSubmit = () => {
    if (!currentUser) return;
    updateUser(
      currentUser?.email ?? "",
      formState.vectaraCustomerId,
      formState.vectaraPersonalApiKey,
      formState.pendingUserEmailsToAdd
    );
  };

  const isUserListEmpty =
    currentChildUserEmails.length === 0 &&
    (formState.pendingUserEmailsToAdd ?? []).length === 0;

  return (
    <Flex as="form" direction="column" gap="1.2rem">
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
        <Box>
          <FormControl style={formControlStyles}>
            <FormLabel style={formLabelStyles}>Role</FormLabel>
            <Select
              border="1px solid #888"
              isDisabled={true}
              value={currentUser?.role}
            >
              <option value="admin">admin</option>
              <option value="user">user</option>
            </Select>
          </FormControl>
        </Box>
      </Flex>
      <Flex gap="1rem">
        <Box>
          <FormControl style={formControlStyles}>
            <FormLabel style={formLabelStyles}>Vectara Customer ID</FormLabel>
            <Input
              type="text"
              value={formState.vectaraCustomerId}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setFormState({
                  ...formState,
                  vectaraCustomerId: e.target.value ?? undefined,
                })
              }
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
              value={formState.vectaraPersonalApiKey}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setFormState({
                  ...formState,
                  vectaraPersonalApiKey: e.target.value ?? undefined,
                })
              }
              border="1px solid #888"
              minWidth="320px"
            />
          </FormControl>
        </Box>
      </Flex>
      <Flex gap="1rem" direction="column" mt="1rem">
        <Heading size="md">Your Users</Heading>
        <Flex
          width="50%"
          border="1px solid #888"
          borderRadius=".375rem"
          padding="1rem"
          gap=".5rem"
          flexWrap="wrap"
        >
          {isUserListEmpty && <>no users yet</>}
          {currentChildUserEmails?.map((email, index) => (
            <Box
              backgroundColor="gray.700"
              padding=".5rem"
              key={`current-child-user-add-email-${email}`}
              borderRadius=".375rem"
              fontWeight={700}
            >
              {email}
            </Box>
          ))}
          {formState.pendingUserEmailsToAdd?.map((email, index) => (
            <Box
              backgroundColor="blue.600"
              padding=".5rem"
              key={`pending-user-add-email-${email}`}
              borderRadius=".375rem"
              fontWeight={700}
            >
              {email}
            </Box>
          ))}
        </Flex>
        <Box width="50%">
          <FormControl style={formControlStyles}>
            <Input
              type="text"
              value={formState.userEmailToAdd}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                setFormErrors((prev) => ({
                  ...prev,
                  userEmailToAdd: true,
                }));
                setFormState({
                  ...formState,
                  userEmailToAdd: e.target.value ?? undefined,
                });
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  const email = formState.userEmailToAdd;

                  const isEmailValid = String(email)
                    .toLowerCase()
                    .match(
                      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
                    );

                  const userHasAlreadyBeenAdded =
                    (formState.pendingUserEmailsToAdd ?? []).indexOf(email!) >
                    -1;

                  if (!isEmailValid || userHasAlreadyBeenAdded) {
                    setFormErrors((prev) => ({
                      ...prev,
                      userEmailToAdd: true,
                    }));
                    return;
                  }

                  setFormState({
                    ...formState,
                    userEmailToAdd: undefined,
                    pendingUserEmailsToAdd: [
                      ...(formState.pendingUserEmailsToAdd ?? []),
                      email!,
                    ],
                  });
                }
              }}
              placeholder="Add a user with their email address"
              border="1px solid #888"
              minWidth="320px"
            />
          </FormControl>
        </Box>
      </Flex>
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
  fontWeight: "500",
  margin: 0,
  marginBottom: "0.75rem",
};

const formControlStyles = {
  display: "flex",
  flexDirection: "column",
} as CSSProperties;

export default Profile;
