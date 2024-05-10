import { ChangeEvent, ReactNode, useEffect, useRef, useState } from "react";
import { usePortal } from "../portal/[id]/usePortal";
import { useFileUpload } from "../hooks/useFileUpload";
import {
  Box,
  Button as ChakraButton,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  Flex,
  FormControl,
  FormLabel,
  IconButton,
  Input,
  Select,
  Spinner,
  Switch,
  Text,
  Textarea,
  useToast,
} from "@chakra-ui/react";
import { FileUploader } from "react-drag-drop-files";
import { PortalData, PortalType } from "../types";
import {
  AddIcon,
  ArrowBackIcon,
  ArrowForwardIcon,
  CheckIcon,
  CloseIcon,
  SmallCloseIcon,
} from "@chakra-ui/icons";
import { useRouter } from "next/navigation";
import { useDocuments } from "../hooks/useDocuments";
import { IoMdRefresh } from "react-icons/io";

interface ManagementPanelProps {
  portalData: PortalData;
  onClose: () => void;
  onSave: (updatedPortalData: PortalData) => void;
}

const FILE_TYPES = ["PDF", "DOC", "TXT", "HTML", "RTF"];

export const ManagementPanel = ({
  portalData,
  onClose,
  onSave,
}: ManagementPanelProps) => {
  const toast = useToast();
  const router = useRouter();
  const {
    getDocumentsForCorpus,
    deleteDocument,
    getNextPage,
    getPrevPage,
    reloadCurrentPage,
  } = useDocuments(portalData.vectaraCorpusId);

  const [documents, setDocuments] = useState<Array<{ id: string }>>([]);
  const [isLoadingDocuments, setIsLoadingDocuments] = useState<boolean>(false);

  const getDocuments = async () => {
    setIsLoadingDocuments(true);
    const docs = await getDocumentsForCorpus();
    setIsLoadingDocuments(false);
    setDocuments(docs.map((doc: any) => ({ id: doc.id })));
  };

  useEffect(() => {
    getDocuments();
  }, [portalData.vectaraCorpusId]);

  const [updatedPortalName, setUpdatedPortalName] = useState<string>(
    portalData.name
  );

  const [updatedPortalDescription, setUpdatedPortalDescription] =
    useState<string>(portalData.description ?? "");

  const [updatedPortalType, setUpdatedPortalType] = useState<PortalType>(
    portalData.type
  );

  const [updatedIsRestricted, setUpdatedIsRestricted] = useState<boolean>(
    portalData.isRestricted
  );

  const { updatePortal, deletePortal } = usePortal();
  const [didInitiateDelete, setDidInitiateDelete] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const deleteConfirmationRef = useRef<HTMLDivElement>(null);

  const { queueFilesForUpload, isUploading } = useFileUpload(
    portalData.vectaraCorpusId
  );

  const saveUpdates = () => {
    updatePortal(
      portalData.portalKey,
      updatedPortalName,
      false,
      updatedPortalType,
      updatedPortalDescription
    );

    onSave({
      ...portalData,
      portalKey: portalData.portalKey,
      name: updatedPortalName,
      isRestricted: false,
      type: updatedPortalType,
      description: updatedPortalDescription,
    });
  };

  const onPreDelete = () => {
    setDidInitiateDelete(true);

    setTimeout(
      () =>
        deleteConfirmationRef.current?.scrollIntoView({ behavior: "smooth" }),
      125
    );
  };

  const onDelete = async () => {
    setIsDeleting(true);
    try {
      await deletePortal(portalData.portalKey);
      toast({
        title: "Portal deleted!",
        description: "Taking you to your Portals page...",
        status: "success",
        duration: 5000,
      });
      onClose();

      setTimeout(() => router.push("/portals"), 3000);
    } catch {
      setIsDeleting(false);
      toast({
        title: "We couldn't delete your portal",
        description: "Please try again",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Flex as="form" direction="column" color="#ddd" height="100%">
      <DrawerHeader color="#ddd" fontSize="1rem" background="#444">
        Manage your Portal
      </DrawerHeader>

      <DrawerBody
        display="flex"
        flexDirection="column"
        gap="1rem"
        paddingBottom="2rem"
      >
        <FormControl>
          <FormLabel style={formLabelStyles}>Name</FormLabel>
          <Input
            type="text"
            value={updatedPortalName}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setUpdatedPortalName(e.target.value)
            }
            border="1px solid #888"
          />
        </FormControl>
        <FormControl>
          <FormLabel style={formLabelStyles}>Description</FormLabel>
          <Textarea
            value={updatedPortalDescription}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
              setUpdatedPortalDescription(e.target.value)
            }
            border="1px solid #888"
          />
        </FormControl>
        <FormControl>
          <FormLabel style={formLabelStyles}>Type</FormLabel>
          <Select
            placeholder="Select option"
            border="1px solid #888"
            onChange={(e: ChangeEvent<HTMLSelectElement>) => {
              setUpdatedPortalType(e.target.value as PortalType);
            }}
            value={updatedPortalType}
          >
            <option value="search">Search</option>
            <option value="summary">Summary</option>
            <option value="chat">Chat</option>
          </Select>
        </FormControl>
        <FormControl mt="1rem">
          <Flex direction="column" gap=".25rem">
            <Flex width="100%" alignItems="center">
              <FormLabel style={{ ...formLabelStyles, marginBottom: 0 }}>
                Documents
              </FormLabel>
              <Flex flexGrow={1} justifyContent="flex-end" alignItems="center">
                {isUploading ? (
                  <Spinner size="sm" color="#888" />
                ) : (
                  <Flex alignItems="center">
                    <IconButton
                      aria-label="Upload file"
                      icon={<IoMdRefresh color="#888" />}
                      height=".9rem"
                      width=".9rem"
                      minWidth="none"
                      borderRadius=".125rem"
                      variant="outline"
                      border="none"
                      onClick={() => getDocuments()}
                    />
                    <Flex className="file-uploader-wrapper">
                      <FileUploader
                        handleChange={(files: FileList) => {
                          queueFilesForUpload(files);
                        }}
                        name="files"
                        types={FILE_TYPES}
                        multiple={true}
                        display="flex"
                      >
                        <Flex
                          padding="0 .25rem"
                          alignItems="center"
                          className="foo"
                        >
                          <IconButton
                            aria-label="Upload file"
                            icon={<AddIcon boxSize=".6rem" color="#888" />}
                            height=".9rem"
                            width=".9rem"
                            minWidth="none"
                            borderRadius=".125rem"
                            variant="outline"
                            border="none"
                          />
                        </Flex>
                      </FileUploader>
                    </Flex>
                  </Flex>
                )}
              </Flex>
            </Flex>

            <Flex
              direction="column"
              color="#ddd"
              gap="0.25rem"
              borderRadius="0.5rem"
              minHeight="2rem"
            >
              {isLoadingDocuments ? (
                <Flex gap=".25rem" alignItems="center">
                  <Spinner color="#888" size="xs" />
                  <Text fontSize=".75rem">Loading documents</Text>
                </Flex>
              ) : (
                documents.map((document) => (
                  <Document
                    key={`document-${portalData.vectaraCorpusId}-${document.id}`}
                    documentId={document.id}
                    onDelete={deleteDocument}
                  />
                ))
              )}
              <Flex>
                <Flex justifyContent="flex-start" width="50%">
                  {getPrevPage && (
                    <IconButton
                      size="xs"
                      aria-label="Previous page of documents"
                      icon={<ArrowBackIcon />}
                      onClick={async () => {
                        const docs = await getPrevPage();
                        setDocuments(docs);
                      }}
                    />
                  )}
                </Flex>
                <Flex justifyContent="flex-end" width="50%">
                  {getNextPage && (
                    <IconButton
                      aria-label="Next page of documents"
                      size="xs"
                      icon={<ArrowForwardIcon />}
                      onClick={async () => {
                        const docs = await getNextPage();
                        setDocuments(docs);
                      }}
                    />
                  )}
                </Flex>
              </Flex>
            </Flex>
          </Flex>
        </FormControl>
        <FormControl mt="1rem">
          <Flex direction="column">
            <Flex alignItems="center" gap=".5rem" direction="column">
              <Flex gap=".5rem" grow={1} width="100%">
                <FormLabel style={{ ...formLabelStyles, marginBottom: 0 }}>
                  Restricted
                </FormLabel>
                <Switch
                  checked={updatedIsRestricted}
                  onChange={() => setUpdatedIsRestricted((prev) => !prev)}
                />
              </Flex>
            </Flex>
          </Flex>
        </FormControl>
        <FormControl mt="1rem">
          <Flex>
            <Flex
              flexGrow={1}
              justifyContent="center"
              direction="column"
              gap=".5rem"
            >
              <ChakraButton
                size="sm"
                onClick={onPreDelete}
                colorScheme="red"
                width="100%"
                isDisabled={isDeleting}
              >
                {"Delete this portal"}
              </ChakraButton>
              {didInitiateDelete && (
                <Flex
                  gap=".5rem"
                  justifyContent="flex-end"
                  alignItems="center"
                  ref={deleteConfirmationRef}
                >
                  <Text fontSize=".75rem" fontWeight={500}>
                    Are you sure?
                  </Text>
                  <ChakraButton
                    size="xs"
                    onClick={onPreDelete}
                    colorScheme="red"
                    isDisabled={isDeleting}
                  >
                    <SmallCloseIcon boxSize="1.1rem" />
                  </ChakraButton>
                  <ChakraButton
                    size="xs"
                    onClick={onDelete}
                    colorScheme="green"
                    isDisabled={isDeleting}
                  >
                    <CheckIcon />
                  </ChakraButton>
                </Flex>
              )}
            </Flex>
          </Flex>
        </FormControl>
      </DrawerBody>

      <DrawerFooter background="#444">
        <ChakraButton
          variant="outline"
          p=".5rem 1rem"
          mr={3}
          onClick={() => {}}
          color="#ddd"
          fontSize=".75rem"
          isDisabled={isDeleting}
        >
          Cancel
        </ChakraButton>
        <ChakraButton
          colorScheme="blue"
          p=".5rem 1rem"
          onClick={(e: any) => {
            e.preventDefault();
            saveUpdates();
            onClose();
          }}
          fontSize=".75rem"
          isDisabled={isDeleting}
        >
          Save
        </ChakraButton>
      </DrawerFooter>
    </Flex>
  );
};

const Document = ({
  documentId,
  onDelete,
}: {
  documentId: string;
  onDelete: (documentId: string) => void;
}) => {
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [isDeleted, setIsDeleted] = useState<boolean>(false);

  let interactiveEl: ReactNode | null = <CloseIcon boxSize=".5rem" />;

  if (isDeleted) {
    interactiveEl = null;
  } else if (isDeleting) {
    interactiveEl = <Spinner boxSize=".5rem" />;
  }

  return (
    <Flex
      key={`document-${documentId}`}
      width="100%"
      padding=".25rem .5rem"
      borderRadius=".25rem"
      background="#555"
      fontSize=".8rem"
      fontWeight={600}
      alignItems="center"
      opacity={isDeleting || isDeleted ? 0.4 : 1.0}
    >
      <Box flexGrow={1}>{documentId}</Box>
      <Box
        fontWeight={400}
        cursor="pointer"
        onClick={async (e: any) => {
          // TODO: verify deletion
          e.preventDefault();
          setIsDeleting(true);
          await onDelete(documentId);
          setIsDeleting(false);
          setIsDeleted(true);
        }}
        onMouseUp={(e: any) => e.preventDefault()}
      >
        {interactiveEl}
      </Box>
    </Flex>
  );
};

// TODO: Create common FormLabel
const formLabelStyles = {
  fontWeight: "400",
  fontSize: ".8rem",
  margin: 0,
  marginBottom: "0.75rem",
};
