import { PortalData } from "@/app/types";
import {
  ChatSummaryBase,
  applyCitationOrder,
  markDownCitations,
  reorderCitations,
} from "./ChatSummaryBase";
import { useChat } from "@vectara/react-chatbot/lib/useChat";
import { Box, Flex, Text } from "@chakra-ui/react";
import Markdown from "markdown-to-jsx";
import { DeserializedSearchResult } from "@vectara/react-search/lib/types";
import { useState } from "react";
import { ACTION_QUERY_PORTAL } from "@/app/analytics";
import { useAmplitude } from "amplitude-react";

export const Chat = (props: PortalData) => {
  const {
    sendMessage,
    messageHistory,
    activeMessage,
    isLoading,
    isStreamingResponse,
  } = useChat(
    props.vectaraCustomerId,
    [props.vectaraCorpusId],
    props.vectaraApiKey
  );

  const { logEvent } = useAmplitude();

  const [viewedReferenceIndex, setViewedReferenceIndex] = useState<
    number | undefined
  >();

  let sanitizedAnswer: string | undefined = undefined;
  let latestReferences: Array<DeserializedSearchResult>;

  // TODO: Clean this up. We can use the if/else to define data sources and move func execution outside of conditionals.
  if (activeMessage) {
    latestReferences = (
      activeMessage.results
        ? applyCitationOrder(activeMessage.results, activeMessage.answer)
        : []
    ).slice(0, 7);
    const reorderedAnswer = activeMessage.results
      ? reorderCitations(activeMessage.answer)
      : activeMessage.answer;
    sanitizedAnswer = markDownCitations(reorderedAnswer);
  } else if (messageHistory.length) {
    latestReferences = latestReferences = (
      messageHistory[messageHistory.length - 1].results
        ? applyCitationOrder(
            messageHistory[messageHistory.length - 1].results,
            messageHistory[messageHistory.length - 1].answer
          )
        : []
    ).slice(0, 7);
    const reorderedAnswer = messageHistory[messageHistory.length - 1].results
      ? reorderCitations(messageHistory[messageHistory.length - 1].answer)
      : messageHistory[messageHistory.length - 1].answer;
    sanitizedAnswer = markDownCitations(reorderedAnswer);
  } else {
    latestReferences = [];
  }

  const messages = messageHistory.map((turn, index) => {
    let answerToRender = turn.answer;

    if (!activeMessage && index === messageHistory.length - 1) {
      answerToRender = sanitizedAnswer;
    }
    return (
      <Turn
        key={`turn-${index}`}
        question={turn.question}
        answer={answerToRender}
        onClickReference={(index: number) => setViewedReferenceIndex(index)}
      />
    );
  });

  return (
    <ChatSummaryBase
      onQuery={(query) => {
        logEvent(ACTION_QUERY_PORTAL, {
          type: "chat",
          portalKey: props.portalKey,
        });
        sendMessage({ query });
      }}
      references={latestReferences}
      viewedReferenceIndex={viewedReferenceIndex}
    >
      <Flex direction="column" gap="1rem">
        {messages}
        {activeMessage && (
          <Turn
            question={activeMessage.question}
            answer={sanitizedAnswer}
            isActive={true}
            isLoading={isLoading}
            isStreaming={isStreamingResponse}
            onClickReference={(index: number) => setViewedReferenceIndex(index)}
          />
        )}
      </Flex>
    </ChatSummaryBase>
  );
};

const Turn = ({
  question,
  answer,
  onClickReference = () => {
    /*noop*/
  },
  isLoading = false,
  isStreaming = false,
  results,
}: {
  question: string;
  answer?: string;
  onClickReference?: (referenceIndex: number) => void;
  isActive?: boolean;
  isLoading?: boolean;
  isStreaming?: boolean;
  results?: Array<DeserializedSearchResult>;
}) => {
  const SummaryCitation = ({ reference }: { reference: string }) => {
    const referenceIndex = parseInt(reference);
    return (
      <>
        {" "}
        <button onClick={() => onClickReference(referenceIndex)}>
          <Text as="span" fontWeight={700} color="blue.500">
            [{reference}]
          </Text>
        </button>
      </>
    );
  };

  return (
    <Flex direction="column" gap=".5rem" mb="1rem">
      <Flex>
        <Box
          backgroundColor="green.600"
          padding=".5rem 1rem"
          borderRadius=".25rem"
          fontWeight={400}
        >
          {question}
        </Box>
      </Flex>

      <Flex>
        <Flex
          justifyContent="flex-start"
          backgroundColor="gray.600"
          padding=".5rem 1rem"
          borderRadius=".25rem"
          fontWeight={400}
        >
          {isLoading ? (
            <Box p=".5rem">
              <div className="dot-flashing" />
            </Box>
          ) : (
            <Box>
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
                {!isStreaming && !answer
                  ? "I couldn't find anything related to that."
                  : answer ?? ""}
              </Markdown>
            </Box>
          )}
        </Flex>
      </Flex>
    </Flex>
  );
};
