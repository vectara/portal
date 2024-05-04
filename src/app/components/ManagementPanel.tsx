import { ChangeEvent, useState } from "react";
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
  Input,
  Switch,
} from "@chakra-ui/react";
import { FileUploader } from "react-drag-drop-files";

interface ManagementPanelProps {
  customerId: string;
  corpusId: string;
  portalKey: string;
  portalName: string;
  isRestricted: boolean;
  onClose: () => void;
  onSave: (updatedName: string) => void;
}

const FILE_TYPES = ["PDF"];

export const ManagementPanel = ({
  customerId,
  corpusId,
  portalKey,
  portalName,
  isRestricted,
  onClose,
  onSave,
}: ManagementPanelProps) => {
  const [updatedPortalName, setUpdatedPortalName] =
    useState<string>(portalName);

  const [updatedIsRestricted, setUpdatedIsRestricted] =
    useState<boolean>(isRestricted);
  const { updatePortal } = usePortal();
  const {
    uploadFilesToCorpus,
    addedFiles,
    queueFileForUpload,
    removeQueuedFile,
  } = useFileUpload();

  const saveUpdates = () => {
    updatePortal(portalKey, updatedPortalName, false);
    uploadFilesToCorpus(customerId, corpusId);

    onSave(updatedPortalName);
  };

  return (
    <Flex as="form" direction="column" color="#ddd" height="100%">
      <DrawerHeader color="#ddd" fontSize="1rem" background="#444">
        Manage your Portal
      </DrawerHeader>

      <DrawerBody>
        <FormControl>
          <FormLabel style={formLabelStyles}>Portal Name</FormLabel>
          <Input
            type="text"
            value={updatedPortalName}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setUpdatedPortalName(e.target.value)
            }
            border="1px solid #888"
          />
        </FormControl>
        <FormControl mt="1rem">
          <Flex direction="column">
            <FormLabel style={formLabelStyles}>Add/Remove Data</FormLabel>
            <Box className="file-uploader-wrapper">
              <FileUploader
                handleChange={(file: FileList) => {
                  queueFileForUpload(file);
                }}
                name="file"
                types={FILE_TYPES}
                classes={`file-uploader ${
                  addedFiles.length > 0 ? "with-files" : ""
                }`}
                multiple={true}
              >
                {addedFiles.length ? (
                  addedFiles.map((filename, index) => (
                    <Flex
                      key={`queued-file-${index}`}
                      border="1px solid #888"
                      width="100%"
                      p=".25rem .5rem"
                      borderRadius=".5rem"
                      fontSize=".8rem"
                      backgroundColor="#555"
                      fontWeight={600}
                      alignItems="center"
                    >
                      <Box flexGrow={1}>{filename}</Box>
                      <Box
                        fontWeight={400}
                        cursor="pointer"
                        onClick={(e: any) => {
                          e.preventDefault();
                          removeQueuedFile(index);
                        }}
                        onMouseUp={(e: any) => e.preventDefault()}
                      >
                        x
                      </Box>
                    </Flex>
                  ))
                ) : (
                  <div>Click or drag files here</div>
                )}
              </FileUploader>
            </Box>
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
              {updatedIsRestricted && (
                <>
                  <Flex
                    width="100%"
                    border="1px solid #888"
                    borderRadius=".375rem"
                    padding="1rem"
                    gap=".5rem"
                    flexWrap="wrap"
                  >
                    <div>no users yet</div>
                  </Flex>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="Search for a user"
                      border="1px solid #888"
                    />
                  </FormControl>
                </>
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
        >
          Save
        </ChakraButton>
      </DrawerFooter>
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
