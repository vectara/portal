import { PortalData } from "../../types";
import { useState } from "react";
import { DeserializedSearchResult } from "@vectara/react-search/lib/types";
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
import { useUser } from "@/app/hooks/useUser";
import { useAmplitude } from "amplitude-react";
import { ACTION_QUERY_PORTAL } from "@/app/analytics";

export const Summary = (props: PortalData) => {
  const [summary, setSummary] = useState<string | null>();
  const [references, setReferences] =
    useState<Array<DeserializedSearchResult>>();
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [viewedReferenceIndex, setViewedReferenceIndex] = useState<
    number | undefined
  >();
  const { logEvent } = useAmplitude();

  const { currentUser } = useUser();

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
    let summaryPromptName = "vectara-summary-ext-24-05-sml";
    let reranker = 272725718;
    let summaryNumResults = 5;

    if (currentUser?.isVectaraScaleUser) {
      summaryPromptName = "vectara-summary-ext-24-05-med-omni";
      reranker = 272725719;
      summaryNumResults = 10;
    }

    logEvent(ACTION_QUERY_PORTAL, {
      type: "summary",
      portalKey: props.portalKey,
    });

    const requestConfig = {
      filter: "",
      queryValue: query,
      rerank: true,
      rerankNumResults: 100,
      rerankerId: reranker,
      rerankDiversityBias: 0.1,
      customerId: props.vectaraCustomerId,
      corpusIds: [props.vectaraCorpusId],
      endpoint: "api.vectara.io",
      apiKey: props.vectaraApiKey,
      summaryNumResults: summaryNumResults,
      summaryNumSentences: 2,
      language: "eng" as SummaryLanguage,
      summaryPromptName: summaryPromptName,
      lambda: 0.005,
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
      onQuery={(query) => onSummarize(query)}
      // TODO: Figure out why references are occasionally undefined
      references={processedReferences.filter((ref) => ref !== undefined)}
      viewedReferenceIndex={viewedReferenceIndex}
    >
      <Markdown
        options={{
          forceInline: true,
          overrides: {
            SummaryCitation: {
              component: SummaryCitation,
            },
          },
        }}
      >
        {processedSummary}
      </Markdown>
    </ChatSummaryBase>
  );
};
