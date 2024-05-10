"use client";
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Input,
  Select,
  Spinner,
  Switch,
  Textarea,
  useToast,
} from "@chakra-ui/react";
import { Page } from "../../components/Page";
import { CSSProperties, useEffect, useRef, useState } from "react";
import { useCreatePortal } from "./useCreatePortal";
import { PortalType } from "../../types";
import { redirect, useRouter } from "next/navigation";

interface FormState {
  name?: string;
  description?: string;
  type: PortalType;
  isRestricted: boolean;
}

interface FormErrors {
  name: boolean;
  description: boolean;
}

const INITIAL_FORM_STATE: FormState = {
  name: "",
  description: "",
  type: "search",
  isRestricted: false,
};

const INITIAL_FORM_ERRORS: FormErrors = {
  name: false,
  description: false,
};

const Create = () => {
  return (
    <Page
      pageId="create"
      accessPrerequisites={{ loggedInUser: true, vectaraCredentials: true }}
    >
      <Flex padding="2rem" w="100%" justifyContent="center">
        <CreateForm />
      </Flex>
    </Page>
  );
};

const CreateForm = () => {
  const { createPortal } = useCreatePortal();
  const [formState, setFormState] = useState<FormState>(INITIAL_FORM_STATE);
  const [formErrors, setFormErrors] = useState<FormErrors>(INITIAL_FORM_ERRORS);
  const didStartFillingForm = useRef<{ name: boolean; description: boolean }>({
    name: false,
    description: false,
  });
  const toast = useToast();
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const router = useRouter();

  const validateForm = () => {
    return {
      name: didStartFillingForm.current.name && formState.name === "",
      description:
        didStartFillingForm.current.description && formState.description === "",
    };
  };

  const onSubmit = async () => {
    if (!formState.name || !formState.type || !formState.description) return;

    setIsCreating(true);

    const createdPortal = await createPortal(
      formState.name,
      formState.description,
      formState.type,
      formState.isRestricted
    );

    if (createdPortal) {
      toast({
        status: "success",
        title: "Portal Created!",
        description: `${createdPortal.name} is ready! Taking you there now.`,
        duration: 5000,
      });

      setTimeout(() => {
        window.open(`/portal/${createdPortal.key}`, "_blank");
        router.push("/portals");
      }, 3000);
    } else {
      setIsCreating(false);
      toast({
        status: "error",
        title: "Could not create portal",
        description: `Could not create ${formState.name}. Please try again`,
        duration: 5000,
      });
    }
  };

  const onChangeName = (e: React.ChangeEvent<HTMLInputElement>) => {
    didStartFillingForm.current.name = true;
    const updatedName = e.target.value;

    setFormState((prevState) => ({
      ...prevState,
      name: updatedName,
    }));
  };

  const onChangeDescription = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    didStartFillingForm.current.description = true;
    const updatedDescription = e.target.value;

    setFormState((prevState) => ({
      ...prevState,
      description: updatedDescription,
    }));
  };

  const onChangeType = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const updatedType = e.target.value;

    setFormState((prevState) => ({
      ...prevState,
      type: updatedType as PortalType,
    }));
  };

  const onChangeIsRestricted = (e: React.ChangeEvent<HTMLInputElement>) => {
    const updatedIsRestricted = e.target.checked;

    setFormState((prevState) => ({
      ...prevState,
      isRestricted: updatedIsRestricted,
    }));
  };

  useEffect(() => {
    if (
      !didStartFillingForm.current.name &&
      !didStartFillingForm.current.description
    )
      return;

    const updatedFormErrors = validateForm();
    setFormErrors(updatedFormErrors);
  }, [formState]);

  const didFillAllFields =
    didStartFillingForm.current.name && didStartFillingForm.current.description;

  const isSubmitDisabled =
    isCreating ||
    !didFillAllFields ||
    formErrors.name ||
    formErrors.description;

  return (
    <Box>
      <Flex
        background="#242424"
        borderRadius=".5rem"
        border="1px solid #888"
        fontWeight="400"
        padding="2rem 2.5rem"
        direction="column"
        gap="1.25rem"
        minWidth="500px"
      >
        <Heading
          size="lg"
          style={{ fontFamily: "Montserrat" }}
          fontWeight={400}
          color="#ddd"
        >
          Create a Portal
        </Heading>
        <Flex as="form" direction="column" gap="1.5rem">
          <Box>
            <FormControl
              style={formControlStyles}
              isInvalid={formErrors.name}
              onSubmit={onSubmit}
            >
              <FormLabel style={formLabelStyles}>Portal Name</FormLabel>
              <Input
                type="text"
                value={formState.name ?? ""}
                onChange={onChangeName}
                border="1px solid #888"
                color="#ddd"
              />
              {formErrors.name && (
                <FormErrorMessage fontSize="0.75rem" color="red.500">
                  Please enter a name.
                </FormErrorMessage>
              )}
            </FormControl>
          </Box>
          <Box>
            <FormControl
              style={formControlStyles}
              isInvalid={formErrors.description}
              onSubmit={onSubmit}
            >
              <FormLabel style={formLabelStyles}>Portal Description</FormLabel>
              <Textarea
                value={formState.description ?? ""}
                onChange={onChangeDescription}
                border="1px solid #888"
                color="#ddd"
              />
              {formErrors.description && (
                <FormErrorMessage fontSize="0.75rem" color="red.500">
                  Please enter a description.
                </FormErrorMessage>
              )}
            </FormControl>
          </Box>
          <Box>
            <FormControl style={formControlStyles}>
              <FormLabel style={formLabelStyles}>Portal Type</FormLabel>
              <Select
                color="#ddd"
                value={formState.type}
                onChange={onChangeType}
                border="1px solid #888"
              >
                <option value="search">Search</option>
                <option value="summary">Summary</option>
                <option value="chat">Chat</option>
              </Select>
            </FormControl>
          </Box>
          <Box>
            <FormControl
              style={{
                ...formControlStyles,
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <FormLabel
                style={{ ...formLabelStyles, marginBottom: "0" }}
                flexGrow={1}
              >
                Restrict to authorized users?
              </FormLabel>
              <Switch
                isChecked={formState.isRestricted}
                onChange={(e) =>
                  setFormState((prev) => ({
                    ...prev,
                    isRestricted: !prev.isRestricted,
                  }))
                }
              />
            </FormControl>
          </Box>
          <Box>
            <FormControl style={formControlStyles}>
              <Flex alignItems="center" gap=".5rem">
                <Button
                  isDisabled={isSubmitDisabled}
                  onClick={onSubmit}
                  colorScheme="blue"
                >
                  Create it
                </Button>
                {isCreating && <Spinner color="#888" size="sm" />}
              </Flex>
            </FormControl>
          </Box>
        </Flex>
      </Flex>
    </Box>
  );
};

export default Create;

// TODO: Create common form components with prop styles
const formLabelStyles = {
  color: "#ddd",
  fontWeight: "400",
  margin: 0,
  marginBottom: "0.75rem",
};

const formControlStyles = {
  display: "flex",
  flexDirection: "column",
} as CSSProperties;
