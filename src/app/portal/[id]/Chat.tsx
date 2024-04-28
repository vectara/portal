"use client";

import {
  Box,
  Flex,
  Heading,
  Input,
  ListItem,
  Text,
  UnorderedList,
  Button as ChakraButton,
  useToast,
  Tooltip,
} from "@chakra-ui/react";
import { PortalData } from "../../types";
import {
  CSSProperties,
  ChangeEvent,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";

import { DeserializedSearchResult } from "@vectara/react-search/lib/types";

import { ConfigDrawer } from "../../components/ConfigDrawer";
import { Button } from "../../components/Button";
import { GearIcon } from "../../icons/Gear";
import { useFileUploadNotification } from "../../hooks/useFileUploadNotification";
import { ManagementPanel } from "../../components/ManagementPanel";
import Markdown from "markdown-to-jsx";
import { useChat } from "@vectara/react-chatbot/lib/useChat";
import { SaveIcon } from "../../icons/Save";
import { FolderIcon } from "../../icons/Saved";
import { useUser } from "../../hooks/useUser";

interface ParsedSearchResult extends Pick<DeserializedSearchResult, "snippet"> {
  title: string;
  url?: string;
}

export const Chat = (props: PortalData) => {
  const [query, setQuery] = useState<string>("");
  const [summary, setSummary] = useState<string | null>();
  useFileUploadNotification();
  const [isManagementOpen, setIsManagementOpen] = useState<boolean>(false);
  const [portalName, setPortalName] = useState<string>(props.name);
  const [references, setReferences] =
    useState<Array<DeserializedSearchResult> | null>(null);

  const {
    sendMessage,
    messageHistory,
    activeMessage,
    isLoading,
    isStreamingResponse,
  } = useChat(
    props.ownerVectaraCustomerId,
    [props.vectaraCorpusId],
    props.vectaraQueryApiKey
  );

  const { currentUser } = useUser();

  const appLayoutRef = useRef<HTMLDivElement>(null);
  const isScrolledToBottomRef = useRef(true);

  const updateScrollPosition = () => {
    setTimeout(() => {
      if (isScrolledToBottomRef.current) {
        appLayoutRef.current?.scrollTo({
          left: 0,
          top: appLayoutRef.current?.scrollHeight,
          behavior: "smooth",
        });
      }
    }, 0);
  };

  useEffect(() => {
    const layoutNode = appLayoutRef.current;
    const onScrollContent = () => {
      const isScrolledToBottom = appLayoutRef.current
        ? Math.abs(
            appLayoutRef.current.scrollHeight -
              appLayoutRef.current.clientHeight -
              appLayoutRef.current.scrollTop
          ) < 50
        : true;

      isScrolledToBottomRef.current = isScrolledToBottom;
    };

    layoutNode?.addEventListener("scroll", onScrollContent);

    return () => {
      layoutNode?.removeEventListener("scroll", onScrollContent);
    };
  }, []);

  const onSend = async () => {
    if (query.length === 0) return;
    setQuery("");
    sendMessage({ query });
  };

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const messages = messageHistory.map((turn, index) => {
    return (
      <Turn
        key={`turn-${index}`}
        question={turn.question}
        answer={turn.answer}
        references={turn.results}
      />
    );
  });

  useEffect(updateScrollPosition, [messageHistory, activeMessage]);

  return (
    <Flex style={wrapperStyles} gap={4}>
      <Flex direction="column" gap="2rem" align="center">
        <Flex
          direction="column"
          gap="1.25rem"
          align="center"
          style={searchPanelStyles}
        >
          <Heading size="md">{portalName}</Heading>
          <Flex width="100%" justify="center">
            <Box width="12.5%"></Box>
            <Box
              ref={appLayoutRef}
              width="75%"
              maxWidth="600px"
              minWidth="460px"
              height="400px"
              border="1px solid #888"
              backgroundColor="#242424"
              borderRadius="1rem"
              overflow="auto"
              color="#ddd"
              padding="1rem"
            >
              {messages}
              {activeMessage && (
                <Turn
                  question={activeMessage.question}
                  answer={activeMessage.answer}
                  references={activeMessage.references}
                  isActive={true}
                  isLoading={isLoading}
                  isStreaming={isStreamingResponse}
                />
              )}
            </Box>
            <Flex width="12.5%" padding=".5rem" direction="column" gap=".5rem">
              <Tooltip label="Save this chat" placement="right">
                <ChakraButton
                  width="1rem"
                  padding=".5rem"
                  variant="outline"
                  onClick={() => {}}
                  _hover={{
                    backgroundColor: "#777",
                  }}
                >
                  <SaveIcon />
                </ChakraButton>
              </Tooltip>
              <Tooltip label="View saved chats" placement="right">
                <ChakraButton
                  width="1rem"
                  padding=".5rem"
                  variant="outline"
                  onClick={() => {}}
                  _hover={{
                    backgroundColor: "#777",
                  }}
                >
                  <FolderIcon />
                </ChakraButton>
              </Tooltip>
            </Flex>
          </Flex>
          <Flex
            as="form"
            style={searchFormStyles}
            direction="column"
            gap=".5rem"
          >
            <Flex gap=".5rem">
              <Input
                style={inputStyles}
                placeholder="Enter a topic"
                onChange={onChange}
                value={query}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    onSend();
                    e.preventDefault();
                  }
                }}
              />
              <ChakraButton
                colorScheme="blue"
                onClick={() => onSend()}
                padding="1rem"
                fontSize=".8rem"
              >
                Send
              </ChakraButton>
            </Flex>
            <Flex gap=".5rem">
              {currentUser && (
                <Button
                  icon={<GearIcon />}
                  label="Manage"
                  onClick={() => setIsManagementOpen(true)}
                />
              )}
            </Flex>
          </Flex>
        </Flex>
      </Flex>

      <ConfigDrawer
        header="Portal Management"
        isOpen={isManagementOpen}
        onClose={() => setIsManagementOpen(false)}
      >
        <ManagementPanel
          customerId={props.ownerVectaraCustomerId}
          corpusId={props.vectaraCorpusId}
          portalKey={props.portalKey}
          portalName={portalName}
          isRestricted={props.isRestricted}
          onClose={() => setIsManagementOpen(false)}
          onSave={(updatedPortalName: string) =>
            setPortalName(updatedPortalName)
          }
        />
      </ConfigDrawer>
    </Flex>
  );
};

const Turn = ({
  question,
  answer,
  references,
  isLoading = false,
  isStreaming = false,
}: {
  question: string;
  answer: string;
  references: Array<DeserializedSearchResult>;
  isActive?: boolean;
  isLoading?: boolean;
  isStreaming?: boolean;
}) => {
  const toast = useToast();

  const openReferenceToast = (referenceIndex: number) => {
    if (!references || !(references ?? [])[referenceIndex]) return;

    const reference = references[referenceIndex - 1];

    toast({
      title: "Reference",
      description: (
        <Flex direction="column" gap="1rem">
          <Box flexGrow={1}>
            <Text as="span" fontSize=".9rem">
              {reference.snippet.pre}
            </Text>
            <Text as="span" fontWeight={700} fontSize=".9rem">
              {reference.snippet.text}
            </Text>
            <Text as="span" fontSize=".9rem">
              {reference.snippet.post}
            </Text>
          </Box>
          <Box>
            <Text fontSize="0.85rem">
              <strong>source:</strong> {reference.id}
            </Text>
          </Box>
        </Flex>
      ),
      isClosable: true,
      duration: null,
      status: "info",
      position: "top-right",
    });
  };

  const SummaryCitation = ({ reference }: { reference: string }) => {
    const referenceIndex = parseInt(reference);
    return (
      <>
        {" "}
        <button onClick={() => openReferenceToast(referenceIndex)}>
          <Text as="span" fontWeight={700} color="blue.500">
            [{reference}]
          </Text>
        </button>
      </>
    );
  };

  const sanitizedAnswer = markDownCitations(answer);

  return (
    <Flex direction="column" gap=".5rem" mb="1rem">
      <Flex>
        <Box
          backgroundColor="green.600"
          padding=".5rem 1rem"
          borderRadius="1rem"
          fontWeight={500}
          maxWidth="85%"
        >
          {question}
        </Box>
      </Flex>

      <Flex justify="flex-end">
        <Flex
          justifyContent="flex-start"
          backgroundColor="gray.600"
          padding=".5rem 1rem"
          borderRadius="1rem"
          fontWeight={500}
          maxWidth="85%"
        >
          {isLoading ? (
            <Box p=".5rem">
              <div className="dot-flashing" />
            </Box>
          ) : (
            <Box>
              <Markdown
                children={
                  !isStreaming && sanitizedAnswer === ""
                    ? "I couldn't find anything related to that."
                    : sanitizedAnswer
                }
                options={{
                  forceInline: true,
                  overrides: {
                    SummaryCitation: {
                      component: SummaryCitation,
                    },
                  },
                }}
              />
            </Box>
          )}
        </Flex>
      </Flex>
    </Flex>
  );
};

const markDownCitations = (summary: string) => {
  const citations = extractCitations(summary);
  return citations
    .reduce((accum, { text, references }) => {
      if (references) {
        accum.push(text);

        const marginBefore = text ? text[text.length - 1] !== " " : false;
        if (marginBefore) {
          accum.push(" ");
        }

        references.forEach((reference, referenceIndex) => {
          if (referenceIndex > 0) {
            accum.push(" ");
          }

          accum.push(`<SummaryCitation reference={${reference}} />`);
        });
      } else {
        accum.push(text);
      }

      return accum;
    }, [] as string[])
    .join(" ");
};

export const extractCitations = (summary: string) => {
  // Match citations.
  // const regex = /\[(\d+)\]/g;
  const regex = /\[(\d+(,*\s*\d*)*)\]/g;

  const citations: Array<{ text: string; references?: string[] }> = [];

  let match;
  let lastIndex = 0;

  // Parse all cited content.
  while ((match = regex.exec(summary)) !== null) {
    const index = match.index;
    const reference = match[1];
    const text = summary.slice(lastIndex, index).trim();
    // Handle citations that are in the form of [1, 2, 3] or [1,2,3]
    // so normalize to the latter.
    citations.push({
      text,
      references: reference.replace(/\s/g, "").split(","),
    });
    lastIndex = index + match[0].length;
  }

  // Add the remaining content after the last citation.
  const text = summary.slice(lastIndex).trim();
  if (text.length > 0) {
    citations.push({ text });
  }

  return citations;
};

const wrapperStyles = {
  alignItems: "center",
  flexDirection: "column",
  height: "100%",
  justifyContent: "center",
  width: "100%",
  color: "#ddd",
  padding: "1rem",
} as CSSProperties;

const searchFormStyles = {
  maxWidth: "800px",
  minWidth: "460px",
  width: "75%",
};

const inputStyles = {
  border: "1px solid #aaa",
};

const searchPanelStyles = {
  backgroundColor: "#242424",
  borderRadius: "1rem",
  padding: "1.5rem 1rem",
  width: "800px",
  border: "1px solid #555",
};
