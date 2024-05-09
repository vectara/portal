import axios from "axios";
import { useRef, useState } from "react";

export const useDocuments = (corpusId: string) => {
  const [currPageKey, setCurrPageKey] = useState<string | null>(null);
  const [nextPageKey, setNextPageKey] = useState<string | null>(null);

  // TODO: Optimize. This is absolutely not memory-efficient :)
  const [prevPageKeys, setPrevPageKeys] = useState<(string | null)[]>([]);

  const baseUrl = `/api/documents/${corpusId}`;

  const getDocumentsForCorpus = async () => {
    return sendGetDocumentsRequest(baseUrl);
  };

  const reloadCurrentPage = async () => {
    const url = currPageKey ? `${baseUrl}/pageKey=${currPageKey}` : baseUrl;
    return sendGetDocumentsRequest(url);
  };

  const deleteDocument = async (documentId: string) => {
    try {
      const response = await axios({
        method: "delete",
        url: `/api/documents/${corpusId}/${documentId}`,
      });

      const {
        success: { document: documents, nextPageKey: responseNextPageKey },
      } = response.data;

      setCurrPageKey(nextPageKey);

      if (responseNextPageKey) {
        setNextPageKey(responseNextPageKey);
      } else {
        setNextPageKey(null);
      }

      return documents;
    } catch {
      return [];
    }
  };

  const getNextPage = nextPageKey
    ? async () => {
        setPrevPageKeys((prev) => [...prev, currPageKey]);
        return sendGetDocumentsRequest(
          `${baseUrl}?pageKey=${encodeURIComponent(nextPageKey)}`
        );
      }
    : null;

  const getPrevPage =
    prevPageKeys.length || currPageKey
      ? async () => {
          setNextPageKey(currPageKey);
          const pageKey = prevPageKeys[prevPageKeys.length - 1];
          const docs = await sendGetDocumentsRequest(
            pageKey
              ? `${baseUrl}?pageKey=${encodeURIComponent(pageKey)}`
              : baseUrl
          );
          setPrevPageKeys((prev) => prev.slice(0, -1));
          setCurrPageKey(pageKey);
          return docs;
        }
      : null;

  const sendGetDocumentsRequest = async (url: string) => {
    try {
      const response = await axios({
        method: "get",
        url,
      });

      const {
        success: { document: documents, nextPageKey: responseNextPageKey },
      } = response.data;

      setCurrPageKey(nextPageKey);

      if (responseNextPageKey) {
        setNextPageKey(responseNextPageKey);
      } else {
        setNextPageKey(null);
      }

      return documents;
    } catch {
      return [];
    }
  };

  return {
    getDocumentsForCorpus,
    deleteDocument,
    getNextPage,
    getPrevPage,
    reloadCurrentPage,
  };
};
