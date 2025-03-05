import { PortalData } from "../../types";
import { useState } from "react";
import { ApiV2, streamQueryV2 } from "@vectara/stream-query-client";
import { DeserializedSearchResult } from "@vectara/react-search/lib/types";
import {
  ChatSummaryBase,
  applyCitationOrder,
  markDownCitations,
  reorderCitations,
} from "./ChatSummaryBase";
import Markdown from "markdown-to-jsx";
import { Text } from "@chakra-ui/react";
import { useUser } from "@/app/hooks/useUser";
import { ACTION_QUERY_PORTAL } from "@/app/analytics";
import { SummaryLanguage } from "@vectara/react-chatbot/lib/types";
import { parseSnippet } from "@/app/portal/[id]/utils";
import * as amplitude from "@amplitude/analytics-browser";

export const Summary = (props: PortalData) => {
  const [summary, setSummary] = useState<string | null>();
  const [references, setReferences] =
    useState<Array<DeserializedSearchResult>>();
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [viewedReferenceIndex, setViewedReferenceIndex] = useState<
    number | undefined
  >();

  const onStreamEvent = (event: ApiV2.StreamEvent) => {
    switch (event.type) {
      case "requestError":
      case "genericError":
      case "error":
        setIsStreaming(false);
        break;

      case "searchResults":
        const results: Array<DeserializedSearchResult> = [];
        event.searchResults.forEach((document) => {
          const { pre, post, text } = parseSnippet(document.text);

          results.push({
            id: document.document_id,
            snippet: {
              pre,
              text,
              post,
            },
            source: document.document_metadata.source,
            url: document.document_metadata.url,
            title:
              document.document_metadata.title ||
              text.split(" ").slice(0, 10).join(" "),
            metadata: document.document_metadata,
          } as DeserializedSearchResult);
        });
        setReferences(results);

        break;

      case "generationChunk":
        setSummary(event.updatedText ?? undefined);
        break;

      case "end":
        setIsStreaming(false);
        break;
    }
  };

  const onSummarize = (query: string) => {
    if (!query) return;

    amplitude.track(ACTION_QUERY_PORTAL, {
      type: "summary",
      portalKey: props.portalKey,
    });

    const streamQueryConfig: ApiV2.StreamQueryConfig = {
      apiKey: props.vectaraApiKey!,
      customerId: props.vectaraCustomerId,
      query: query,
      corpusKey:
        props.vectaraCorpusKey ??
        getBackupCorpusKey(props.name, props.vectaraCorpusId),
      search: {
        limit: 100,
        offset: 0,
        metadataFilter: "",
        lexicalInterpolation: 0.005,
        reranker: {
                type: "customer_reranker",
                // rnk_ prefix needed for conversion from API v1 to v2.
                rerankerId: `rnk_${272725719}`,
              },
        contextConfiguration: {
          sentencesBefore: 2,
          sentencesAfter: 2,
        },
      },
      generation: {
        generationPresetName: "vectara-summary-ext-24-05-med-omni",
        maxUsedSearchResults: 10,
        responseLanguage: "eng" as SummaryLanguage,
      },
    };
    streamQueryV2({ streamQueryConfig, onStreamEvent });
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
      requestFrom="Summary"
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

// In the event we don't have the corpus key (we will do a future backfill),
// try to derive it. This may not always work.
const getBackupCorpusKey = (portalName: string, corpusId: string) => {
  return `${portalName
    .toLowerCase()
    .replace(/\s/g, "-")}-portal-corpus_${corpusId}`;
};
