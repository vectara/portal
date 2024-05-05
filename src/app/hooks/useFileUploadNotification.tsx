import { Box, ToastId, useToast } from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import { useRecoilState } from "recoil";
import { fileUploadState, useFileUpload } from "./useFileUpload";

export const useFileUploadNotification = () => {
  const [fileUploads] = useRecoilState(fileUploadState);
  const toast = useToast();
  const [didShowInitialToast, setDidShowInitialToast] =
    useState<boolean>(false);

  useEffect(() => {
    if (fileUploads.pendingFiles.length > 0 && !didShowInitialToast) {
      toast({
        title: `Uploading ${fileUploads.pendingFiles.length} files`,
        description: "We'll notify you when it's done.",
        status: "info",
        duration: 5000,
        isClosable: true,
      });
      setDidShowInitialToast(true);
      return;
    }

    if (fileUploads.pendingFiles.length === 0 && didShowInitialToast) {
      toast({
        title: "File upload complete!",
        description: "Updated data will be available shortly",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      setDidShowInitialToast(false);
      return;
    }
  }, [fileUploads.pendingFiles.length]);
};
