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
import {
  CSSProperties,
  ChangeEvent,
  MutableRefObject,
  createRef,
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
import {
  StreamUpdate,
  SummaryLanguage,
  streamQuery,
} from "@vectara/stream-query-client";
import Markdown from "markdown-to-jsx";
import { useUser } from "../../hooks/useUser";
import { ChevronDownIcon, ChevronUpIcon } from "@chakra-ui/icons";
import Link from "next/link";

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
  const [viewedReferenceIndex, setViewedReferenceIndex] = useState<
    number | undefined
  >();

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

  return (
    <Flex style={wrapperStyles} gap={4}>
      <Flex direction="column" gap="1.25rem" align="center" style={panelStyles}>
        <Heading
          size="md"
          fontFamily="Montserrat"
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
          <Box
            flexGrow={1}
            padding="1rem"
            paddingBottom="0"
            minHeight="50%"
            overflow="scroll"
            fontWeight={300}
          >
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
          </Box>
          <References
            references={references ?? []}
            showIndex={viewedReferenceIndex}
          />
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
                  if (!isStreaming) {
                    onSummarize();
                  }

                  e.preventDefault();
                }
              }}
              autoFocus
            />
            <ChakraButton
              colorScheme="blue"
              onClick={() => onSummarize()}
              padding="1rem"
              fontSize=".8rem"
              isDisabled={isStreaming}
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

const References = ({
  references,
  showIndex,
}: {
  references: Array<DeserializedSearchResult>;
  showIndex?: number;
}) => {
  const elRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (showIndex !== undefined && elRefs.current[showIndex - 1]) {
      // TODO: Fix this
      // @ts-ignore
      elRefs.current[showIndex - 1].scrollIntoView({
        behavior: "smooth",
      });
    }
  }, [showIndex]);

  return (
    <Accordion
      allowToggle={true}
      width="100%"
      borderBottomLeftRadius=".5rem"
      borderBottomRightRadius=".5rem"
      reduceMotion={true}
      index={showIndex !== undefined ? 0 : undefined}
      maxHeight="50%"
      overflow="hidden"
    >
      <AccordionItem
        border="none"
        borderTop="1px solid"
        borderTopColor={
          references.length === 0 ? "rgba(255, 255, 255, .25)" : "blue.300"
        }
        backgroundColor={
          references.length === 0 ? "rgba(255, 255, 255, .25)" : "blue.500"
        }
        color="#fff"
        padding="0"
        height="100%"
        display="flex"
        flexDirection="column"
        isDisabled={references.length === 0}
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
                  fontWeight={700}
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
            <Box overflow="scroll">
              <AccordionPanel pb={4} fontSize=".8rem" backgroundColor="#242424">
                {references.map((reference, index) => (
                  <Box
                    ref={(ref) => {
                      elRefs.current[index] = ref;
                    }}
                  >
                    <Reference
                      title={reference.title}
                      snippet={reference.snippet}
                      url={reference.url}
                      index={index}
                    />
                  </Box>
                ))}
              </AccordionPanel>
            </Box>
          </>
        )}
      </AccordionItem>
    </Accordion>
  );
};

const Reference = ({
  title,
  snippet,
  url,
  index,
}: {
  title?: string;
  snippet: {
    pre: string;
    text: string;
    post: string;
  };
  url?: string;
  index: number;
}) => {
  return (
    <Flex
      padding=".5rem 0"
      borderBottom="1px solid #888"
      gap=".5rem"
      direction="column"
    >
      <Box>
        <Text as="span" fontWeight={700} fontSize=".75rem">
          [{index + 1}]
        </Text>{" "}
        <Text
          as="span"
          fontWeight={700}
          fontSize=".75rem"
          textDecoration="underline"
        >
          {title}
        </Text>
      </Box>
      <Box>
        <Box as="span" fontWeight={300}>
          {snippet.pre}
        </Box>
        <Box as="span" fontWeight={700}>
          {snippet.text}
        </Box>
        <Box as="span" fontWeight={300}>
          {snippet.post}
        </Box>
      </Box>
      {url && (
        <Box
          as="span"
          color="blue.500"
          fontWeight={700}
          _hover={{ color: "blue.300" }}
          fontSize=".75rem"
        >
          <Link href={url} target="_blank">
            {url}
          </Link>
        </Box>
      )}
    </Flex>
  );
};

// const ResponseWindowCursor = ({ isIdle }: { isIdle: boolean }) => {
//   const [className, setClassName] = useState<string | undefined>("blink");

//   useEffect(() => {
//     setClassName(isIdle ? "blink" : undefined);
//   }, [isIdle]);

//   return (
//     <Box
//       className={className}
//       as="span"
//       width="8px"
//       height="12px"
//       backgroundColor="#ddd"
//       display="inline"
//       userSelect="none"
//     >
//       {"."}
//     </Box>
//   );
// };
