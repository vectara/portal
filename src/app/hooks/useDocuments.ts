import axios from "axios";
import { useState } from "react";

export const useDocuments = (corpusKey: string, apiKey: string) => {
  const [currPageKey, setCurrPageKey] = useState<string | null>(null);
  const [nextPageKey, setNextPageKey] = useState<string | null>(null);

  // TODO: Optimize. This is absolutely not memory-efficient :)
  const [prevPageKeys, setPrevPageKeys] = useState<(string | null)[]>([]);

  const baseUrl = `https://api.vectara.io/v2/corpora/${corpusKey}/documents`;

  const getDocumentsForCorpus = async () => {

    return sendGetDocumentsRequest(baseUrl, null);
  };

  const reloadCurrentPage = async () => {
    return sendGetDocumentsRequest(baseUrl, currPageKey);
  };

  const deleteDocument = async (documentId: string) => {
    try {
      const response = await axios({
        method: "delete",
        url: `https://api.vectara.io/v2/corpora/${corpusKey}/documents/${documentId}`,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "x-api-key": apiKey,
        },
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
        return sendGetDocumentsRequest(baseUrl, nextPageKey);
      }
    : null;

  const getPrevPage =
    prevPageKeys.length || currPageKey
      ? async () => {
          setNextPageKey(currPageKey);
          const pageKey = prevPageKeys[prevPageKeys.length - 1];
          const docs = await sendGetDocumentsRequest(
            baseUrl, pageKey
          );
          setPrevPageKeys((prev) => prev.slice(0, -1));
          setCurrPageKey(pageKey);
          return docs;
        }
      : null;

  const sendGetDocumentsRequest = async (url: string, pageKey: string | null) => {
    try {
      const response = await axios({
        method: "get",
        url,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "x-api-key": apiKey,
        },
        data: {
          pageKey: pageKey ?? null,
        },
      });
   
      const { documents, metadata } = response.data;
      const responseNextPageKey = metadata?.page_key;

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
