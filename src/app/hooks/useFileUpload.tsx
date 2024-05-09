import { useToast } from "@chakra-ui/react";
import axios from "axios";
import { useEffect, useState } from "react";
import { atom, useRecoilState } from "recoil";

export const useFileUpload = (corpusId: string) => {
  const toast = useToast();
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const queueFilesForUpload = (files: FileList) => {
    const filesArray = Array.from(files);
    uploadFilesToCorpus(filesArray);
  };

  const uploadFilesToCorpus = async (files: Array<File>) => {
    toast({
      title: `Uploading ${files.length} files`,
      description: "We'll notify you when it's done.",
      status: "info",
      duration: 5000,
      isClosable: true,
    });
    setIsUploading(true);
    files.forEach(async (file, index) => {
      const resp = await uploadFileToCorpus(corpusId, file);

      if (resp.data.success) {
        if (index === files.length - 1) {
          toast({
            title: "File upload complete!",
            description: "Updated data will be available shortly",
            status: "success",
            duration: 5000,
            isClosable: true,
          });

          setIsUploading(false);
        }
      }
    });
  };

  const uploadFileToCorpus = async (corpusId: string, file: File) => {
    const data = {
      corpusId,
      file,
    };

    const config = {
      method: "post",
      maxBodyLength: Infinity,
      url: "/api/file-upload",
      headers: {
        "Content-Type": "multipart/form-data",
        Accept: "application/json",
      },
      data: data,
    };

    return axios(config);
  };

  return {
    queueFilesForUpload,
    isUploading,
  };
};
