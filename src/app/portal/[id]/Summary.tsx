import {
  Box,
  Flex,
  Heading,
  Input,
  Text,
  Button as ChakraButton,
  useToast,
  Accordion,
  AccordionPanel,
  AccordionItem,
  AccordionButton,
  AccordionIcon,
} from "@chakra-ui/react";
import { PortalData } from "../../types";
import { CSSProperties, ChangeEvent, useEffect, useRef, useState } from "react";

import { DeserializedSearchResult } from "@vectara/react-search/lib/types";

import { ConfigDrawer } from "../../components/ConfigDrawer";
import { Button } from "../../components/Button";
import { GearIcon } from "../../icons/Gear";
import { useFileUploadNotification } from "../../hooks/useFileUploadNotification";
import { ManagementPanel } from "../../components/ManagementPanel";
import {
  StreamUpdate,
  SummaryLanguage,
  streamQuery,
} from "@vectara/stream-query-client";
import Markdown from "markdown-to-jsx";
import { useUser } from "../../hooks/useUser";
import { ChevronDownIcon, ChevronUpIcon } from "@chakra-ui/icons";

export const Summary = (props: PortalData) => {
  const [didInitiateSearch, setDidInitiateSearch] = useState<boolean>(false);
  const [query, setQuery] = useState<string>("");
  const [summary, setSummary] = useState<string | null>();
  useFileUploadNotification();
  const [isManagementOpen, setIsManagementOpen] = useState<boolean>(false);
  const [portalName, setPortalName] = useState<string>(props.name);
  const [references, setReferences] =
    useState<Array<DeserializedSearchResult> | null>(null);
  const toast = useToast();
  const [isStreaming, setIsStreaming] = useState<boolean>(false);

  const { currentUser } = useUser();

  const onReceiveSummary = (update: StreamUpdate) => {
    setIsStreaming(true);

    if (update.references) {
      setReferences(update.references);
    }

    if (update.updatedText) {
      const sanitized = markDownCitations(update.updatedText);
      setSummary(sanitized);
    }

    if (update.isDone) {
      setIsStreaming(false);
    }
  };

  const onSummarize = () => {
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

    setQuery("");
  };

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

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

  return (
    <Flex style={wrapperStyles} gap={4}>
      <Flex direction="column" gap="1.25rem" align="center" style={panelStyles}>
        <Heading
          size="md"
          fontFamily={'"Source Code Pro", monospace;'}
          width="100%"
          paddingBottom=".5rem"
          borderBottom="1px solid #888"
          fontWeight={400}
        >
          {portalName}
        </Heading>
        <Flex
          width="100%"
          border="1px solid #888"
          backgroundColor="#242424"
          borderRadius=".5rem"
          overflow="auto"
          color="#ddd"
          flexGrow={1}
          direction="column"
          gap=".75rem"
        >
          <Box flexGrow={1} padding="1rem" paddingBottom="0">
            <Markdown
              children={summary ?? ""}
              options={{
                forceInline: true,
                overrides: {
                  SummaryCitation: {
                    component: SummaryCitation,
                  },
                },
              }}
            />
            <Cursor isIdle={!isStreaming} />
          </Box>
          <Accordion
            allowToggle={true}
            width="100%"
            borderBottomLeftRadius=".5rem"
            borderBottomRightRadius=".5rem"
            reduceMotion={true}
            borderTop="1px solid"
            borderTopColor="blue.300"
          >
            <AccordionItem
              border="none"
              backgroundColor="blue.500"
              color="#fff"
              padding="0"
            >
              {({ isExpanded }) => (
                <>
                  <h2>
                    <AccordionButton>
                      <Box
                        as="span"
                        flex="1"
                        textAlign="left"
                        fontSize=".75rem"
                      >
                        References
                      </Box>
                      {isExpanded ? (
                        <ChevronDownIcon fontSize="12px" />
                      ) : (
                        <ChevronUpIcon fontSize="12px" />
                      )}
                    </AccordionButton>
                  </h2>
                  <AccordionPanel
                    pb={4}
                    fontSize=".8rem"
                    backgroundColor="#242424"
                  >
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
                    do eiusmod tempor incididunt ut labore et dolore magna
                    aliqua. Ut enim ad minim veniam, quis nostrud exercitation
                    ullamco laboris nisi ut aliquip ex ea commodo consequat.
                  </AccordionPanel>
                </>
              )}
            </AccordionItem>
          </Accordion>
        </Flex>

        <Flex as="form" style={searchFormStyles} direction="column" gap=".5rem">
          <Flex gap=".5rem">
            <Input
              style={inputStyles}
              placeholder="Ask a question"
              onChange={onChange}
              value={query}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  onSummarize();
                  e.preventDefault();
                }
              }}
            />
            <ChakraButton
              colorScheme="blue"
              onClick={() => onSummarize()}
              padding="1rem"
              fontSize=".8rem"
            >
              Summarize
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

      <ConfigDrawer
        header="Portal Management"
        isOpen={isManagementOpen}
        onClose={() => setIsManagementOpen(false)}
      >
        <ManagementPanel
          customerId={props.vectaraCustomerId}
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
  width: "100%",
};

const inputStyles = {
  border: "1px solid #aaa",
};

const panelStyles = {
  backgroundColor: "#242424",
  height: "100%",
  padding: "1.5rem 1rem",
  border: "1px solid #555",
  borderRadius: ".5rem",
  width: "100%",
};

const Cursor = ({ isIdle }: { isIdle: boolean }) => {
  const [className, setClassName] = useState<string | undefined>("blink");

  useEffect(() => {
    setClassName(isIdle ? "blink" : undefined);
  }, [isIdle]);

  return (
    <Box
      className={className}
      as="span"
      width="8px"
      height="12px"
      backgroundColor="#ddd"
      display="inline"
      userSelect="none"
    >
      {"."}
    </Box>
  );
};
