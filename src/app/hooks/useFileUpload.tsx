import axios from "axios";
import { useState, useRef } from "react";
import { atom, useRecoilState } from "recoil";

export const useFileUpload = () => {
  const [queuedFileObjects, setQueuedFileObjects] = useState<Array<File>>([]);
  const [fileUploads, setFileUploads] = useRecoilState(fileUploadState);

  const queueFileForUpload = (filelist: FileList) => {
    setQueuedFileObjects((prev) => [...prev, filelist[0]]);

    setFileUploads((prev) => {
      return {
        ...prev,
        addedFiles: [...prev.addedFiles, filelist[0].name],
      };
    });
  };

  const uploadFilesToCorpus = (customerId: string, corpusId: string) => {
    const pendingFiles = [...fileUploads.addedFiles];

    setFileUploads({
      ...fileUploads,
      pendingFiles,
      progress:
        (fileUploads.addedFiles.length - pendingFiles.length) /
        fileUploads.addedFiles.length,
    });

    queuedFileObjects.forEach(async (file) => {
      const resp = await uploadFileToCorpus(customerId, corpusId, file);

      if (resp.data.success) {
        removeUploadedFileFromQueue(file.name);
      }
    });
  };

  const removeUploadedFileFromQueue = (fileName: string) => {
    setFileUploads((prev) => {
      const updatedPendingFiles = prev.pendingFiles.filter(
        (fname) => fname !== fileName
      );
      return {
        ...prev,
        addedFiles: updatedPendingFiles.length === 0 ? [] : prev.addedFiles,
        pendingFiles: updatedPendingFiles,
      };
    });
  };

  const removeQueuedFile = (indexToRemove: number) => {
    setQueuedFileObjects((prev) => {
      return prev.splice(indexToRemove, 0);
    });

    setFileUploads((prev) => {
      const updatedAddedFiles = prev.addedFiles.filter(
        (file, index) => index !== indexToRemove
      );
      return {
        ...prev,
        addedFiles: updatedAddedFiles,
      };
    });
  };

  const uploadFileToCorpus = async (
    customerId: string,
    corpusId: string,
    file: File
  ) => {
    const data = {
      customerId,
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
    queueFileForUpload,
    uploadFilesToCorpus,
    removeQueuedFile,
    pendingFiles: fileUploads.pendingFiles,
    addedFiles: fileUploads.addedFiles,
    progress: fileUploads.progress,
  };
};

export const fileUploadState = atom<{
  addedFiles: Array<string>;
  pendingFiles: Array<string>;
  progress: number;
}>({
  key: "fileUploadState", // unique ID (with respect to other atoms/selectors)
  default: {
    addedFiles: [],
    pendingFiles: [],
    progress: 0,
  }, // default value (aka initial value)
});
