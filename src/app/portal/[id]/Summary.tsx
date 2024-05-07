import { PortalData } from "../../types";
import { useState } from "react";
import { DeserializedSearchResult } from "@vectara/react-search/lib/types";
import { useFileUploadNotification } from "../../hooks/useFileUploadNotification";
import {
  StreamUpdate,
  SummaryLanguage,
  streamQuery,
} from "@vectara/stream-query-client";
import {
  ChatSummaryBase,
  applyCitationOrder,
  markDownCitations,
  reorderCitations,
} from "./ChatSummaryBase";
import Markdown from "markdown-to-jsx";
import { Text } from "@chakra-ui/react";

export const Summary = (props: PortalData) => {
  const [summary, setSummary] = useState<string | null>();
  useFileUploadNotification();
  const [references, setReferences] =
    useState<Array<DeserializedSearchResult>>();
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [viewedReferenceIndex, setViewedReferenceIndex] = useState<
    number | undefined
  >();

  const onReceiveSummary = (update: StreamUpdate) => {
    setIsStreaming(true);

    if (update.references) {
      setReferences(update.references);
    }

    if (update.updatedText) {
      setSummary(update.updatedText);
    }

    if (update.isDone) {
      setIsStreaming(false);
    }
  };

  const onSummarize = (query: string) => {
    if (!query) return;

    const requestConfig = {
      filter: "",
      queryValue: query,
      rerank: true,
      rerankNumResults: 10,
      rerankerId: 272725718,
      rerankDiversityBias: 0.3,
      customerId: props.vectaraCustomerId,
      corpusIds: [props.vectaraCorpusId],
      endpoint: "api.vectara.io",
      apiKey: props.vectaraApiKey,
      summaryNumResults: 3,
      summaryNumSentences: 3,
      language: "eng" as SummaryLanguage,
      summaryPromptName: "vectara-summary-ext-v1.2.0",
      chat: { store: false },
    };

    streamQuery(requestConfig, onReceiveSummary);
  };

  const SummaryCitation = ({ reference }: { reference: string }) => {
    const referenceIndex = parseInt(reference);
    return (
      <>
        {" "}
        <button onClick={() => setViewedReferenceIndex(referenceIndex)}>
          <Text as="span" fontWeight={700} color="blue.500">
            [{reference}]
          </Text>
        </button>
      </>
    );
  };

  const processedReferences = applyCitationOrder(
    references ?? [],
    summary ?? ""
  ).slice(0, 7);

  const reorderedAnswer = summary ? reorderCitations(summary) : summary ?? "";
  const processedSummary = markDownCitations(reorderedAnswer);

  return (
    <ChatSummaryBase
      portalData={props}
      onQuery={(query) => onSummarize(query)}
      references={processedReferences}
      viewedReferenceIndex={viewedReferenceIndex}
    >
      <Markdown
        children={processedSummary}
        options={{
          forceInline: true,
          overrides: {
            SummaryCitation: {
              component: SummaryCitation,
            },
          },
        }}
      />
    </ChatSummaryBase>
  );
};
