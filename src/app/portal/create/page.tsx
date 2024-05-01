"use client";
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Heading,
  Input,
  Select,
  Switch,
  useToast,
} from "@chakra-ui/react";
import { Page } from "../../components/Page";
import { CSSProperties, ReactNode, useEffect, useRef, useState } from "react";
import { useCreatePortal } from "./useCreatePortal";
import { PortalType } from "../../types";
import { useRouter } from "next/navigation";
import { useCheckPrequisites } from "../../hooks/useCheckPrerequisites";
import { Centered } from "@/app/components/Centered";

interface FormState {
  name?: string;
  type: PortalType;
  isRestricted: boolean;
}

interface FormErrors {
  name: boolean;
}

const INITIAL_FORM_STATE: FormState = {
  name: undefined,
  type: "search",
  isRestricted: false,
};

const INITIAL_FORM_ERRORS: FormErrors = {
  name: false,
};

const Create = () => {
  return (
    <Page pageId="create">
      <Centered>
        <CreateForm />
      </Centered>
    </Page>
  );
};

const CreateForm = () => {
  const { createPortal } = useCreatePortal();
  const [formState, setFormState] = useState<FormState>(INITIAL_FORM_STATE);
  const [formErrors, setFormErrors] = useState<FormErrors>(INITIAL_FORM_ERRORS);
  const didStartFillingForm = useRef<boolean>(false);
  const toast = useToast();
  const router = useRouter();

  useCheckPrequisites(true);

  const validateForm = (formValues: FormState) => {
    return {
      name: formState.name === "",
    };
  };

  const onSubmit = async () => {
    if (!formState.name || !formState.type) return;
    const createdPortal = await createPortal(
      formState.name,
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
      }, 3000);
    } else {
      toast({
        status: "error",
        title: "Could not create portal",
        description: `Could not create ${formState.name}. Please try again`,
        duration: 5000,
      });
    }
  };

  const onChangeName = (e: React.ChangeEvent<HTMLInputElement>) => {
    didStartFillingForm.current = true;
    const updatedName = e.target.value;

    setFormState((prevState) => ({
      ...prevState,
      name: updatedName,
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
    if (!didStartFillingForm.current) return;

    const updatedFormErrors = validateForm(formState);
    setFormErrors(updatedFormErrors);
  }, [formState]);

  const isSubmitDisabled =
    !didStartFillingForm.current ||
    (didStartFillingForm.current && formErrors.name);

  return (
    <Flex style={formStyles} direction="column" align="center" gap="2rem">
      <Heading size="md" style={{ fontFamily: "Montserrat" }} color="#ddd">
        Create a Portal
      </Heading>
      <Flex as="form" direction="column" gap={8}>
        <Box>
          <FormControl
            style={formControlStyles}
            isInvalid={formErrors.name}
            onSubmit={onSubmit}
          >
            <FormLabel style={formLabelStyles}>
              What would you like to name your portal?
            </FormLabel>
            <Input
              type="text"
              value={formState.name ?? ""}
              onChange={onChangeName}
              border="1px solid #888"
              color="#ddd"
            />
            {!formErrors.name ? (
              <FormHelperText color="#aaa" fontSize="0.75rem">
                This will appear as the title on your portal page.
              </FormHelperText>
            ) : (
              <FormErrorMessage fontSize="0.75rem" color="red.500">
                Please enter a name.
              </FormErrorMessage>
            )}
          </FormControl>
        </Box>
        <Box>
          <FormControl style={formControlStyles}>
            <FormLabel style={formLabelStyles}>
              What kind of portal do you want to create?
            </FormLabel>
            <Select
              color="#ddd"
              defaultValue="search"
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
            <Button isDisabled={isSubmitDisabled} onClick={onSubmit}>
              Create it
            </Button>
          </FormControl>
        </Box>
      </Flex>
    </Flex>
  );
};

export default Create;

// TODO: Create common form components with prop styles
const formLabelStyles = {
  color: "#ddd",
  fontWeight: "500",
  margin: 0,
  marginBottom: "0.75rem",
};

const formStyles = {
  background: "#242424",
  borderRadius: ".5rem",
  border: "1px solid #888",

  fontWeight: "400",
  maxWidth: "640px",
  padding: "2.5rem",
};

const formControlStyles = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
} as CSSProperties;
