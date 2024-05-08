import {
  Box,
  Flex,
  Heading,
  Input,
  Text,
  Button as ChakraButton,
  Accordion,
  AccordionPanel,
  AccordionItem,
  AccordionButton,
  Tooltip,
} from "@chakra-ui/react";
import { PortalData } from "../../types";
import { ChangeEvent, ReactNode, useEffect, useRef, useState } from "react";

import { DeserializedSearchResult } from "@vectara/react-search/lib/types";

import { ConfigDrawer } from "../../components/ConfigDrawer";
import { Button } from "../../components/Button";
import { GearIcon } from "../../icons/Gear";
import { useFileUploadNotification } from "../../hooks/useFileUploadNotification";
import { ManagementPanel } from "../../components/ManagementPanel";
import { useUser } from "../../hooks/useUser";
import { ChevronDownIcon, ChevronUpIcon, InfoIcon } from "@chakra-ui/icons";
import Link from "next/link";
import { PortalPanel } from "./PortalPanel";
import { PortalWrapper } from "./PortalWrapper";
import { PortalHeader } from "./PortalHeader";

interface Props {
  portalData: PortalData;
  onQuery: (query: string) => void;
  placeholder?: string;
  buttonLabel?: string;
  references?: Array<DeserializedSearchResult>;
  viewedReferenceIndex?: number;
  children: React.ReactNode;
}

export const ChatSummaryBase = ({
  portalData,
  onQuery,
  children,
  references,
  buttonLabel = "Send Query",
  placeholder = "Type anything",
  viewedReferenceIndex,
}: Props) => {
  const [query, setQuery] = useState<string>("");
  useFileUploadNotification();
  const [isManagementOpen, setIsManagementOpen] = useState<boolean>(false);
  const [portalName, setPortalName] = useState<string>(portalData.name);
  const [portalType, setPortalType] = useState<string>(portalData.type);
  const [isStreaming, setIsStreaming] = useState<boolean>(false);

  const { currentUser } = useUser();

  const onQueryInternal = () => {
    onQuery(query);
    setQuery("");
  };

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  return (
    <PortalWrapper>
      <PortalPanel>
        <PortalHeader name={portalName} type={portalType} />
        <Flex
          width="100%"
          border="1px solid #888"
          backgroundColor="#242424"
          borderRadius=".5rem"
          overflow="auto"
          color="#ddd"
          flexGrow={1}
          direction="column"
        >
          <Box
            flexGrow={1}
            padding="1rem"
            paddingBottom="0"
            minHeight="50%"
            overflow="scroll"
            fontWeight={300}
          >
            {children}
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
              placeholder={placeholder}
              onChange={onChange}
              value={query}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  onQueryInternal();

                  e.preventDefault();
                }
              }}
              autoFocus
            />
            <ChakraButton
              colorScheme="blue"
              onClick={() => onQueryInternal()}
              padding="1rem"
              fontSize=".8rem"
              isDisabled={isStreaming}
            >
              {buttonLabel}
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
      </PortalPanel>

      <ConfigDrawer
        header="Portal Management"
        isOpen={isManagementOpen}
        onClose={() => setIsManagementOpen(false)}
      >
        <ManagementPanel
          customerId={portalData.vectaraCustomerId}
          corpusId={portalData.vectaraCorpusId}
          portalKey={portalData.portalKey}
          portalName={portalName}
          isRestricted={portalData.isRestricted}
          onClose={() => setIsManagementOpen(false)}
          onSave={(updatedPortalName: string) =>
            setPortalName(updatedPortalName)
          }
        />
      </ConfigDrawer>
    </PortalWrapper>
  );
};

export const markDownCitations = (summary: string) => {
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

const extractCitations = (summary: string) => {
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

const searchFormStyles = {
  width: "100%",
};

const inputStyles = {
  border: "1px solid #aaa",
};

type ReferencesToggleState =
  | undefined
  | "manual_open"
  | "manual_close"
  | "auto_open"
  | "auto_close";

const References = ({
  references,
  showIndex,
}: {
  references: Array<DeserializedSearchResult>;
  showIndex?: number;
}) => {
  const elRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [toggleState, setToggleState] =
    useState<ReferencesToggleState>(undefined);

  const shouldOpenToReference =
    showIndex !== undefined && toggleState !== "manual_close";

  useEffect(() => {
    if (showIndex !== undefined && elRefs.current[showIndex - 1]) {
      setToggleState("auto_open");

      // TODO: Fix this
      // @ts-ignore
      elRefs.current[showIndex - 1].scrollIntoView({
        behavior: "smooth",
      });
    }
  }, [showIndex]);

  const accordionItemIndex = shouldOpenToReference ? 0 : undefined;

  return (
    <Accordion
      allowToggle={true}
      width="100%"
      borderBottomLeftRadius=".5rem"
      borderBottomRightRadius=".5rem"
      reduceMotion={true}
      index={accordionItemIndex}
      maxHeight="50%"
      minHeight="34px"
      overflow="hidden"
      onChange={(expandedIndex: number) => {
        if (expandedIndex > -1 && accordionItemIndex) {
          setToggleState("manual_open");
        } else {
          setToggleState("manual_close");
        }
      }}
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
                    key={`reference-${index}`}
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

export const applyCitationOrder = (
  searchResults: any[],
  unorderedSummary: string
) => {
  const orderedSearchResults: any[] = [];
  const allCitations = unorderedSummary.match(/\[\d+\]/g) || [];

  const addedIndices = new Set<number>();
  for (let i = 0; i < allCitations.length; i++) {
    const citation = allCitations[i];
    const index = Number(citation.slice(1, citation.length - 1)) - 1;

    if (addedIndices.has(index)) continue;
    orderedSearchResults.push(searchResults[index]);
    addedIndices.add(index);
  }

  return orderedSearchResults;
};

export const reorderCitations = (unorderedSummary: string) => {
  const allCitations = unorderedSummary.match(/\[\d+\]/g) || [];

  const uniqueCitations = Array.from(new Set(allCitations));
  const citationToReplacement: { [key: string]: string } = {};
  uniqueCitations.forEach((citation, index) => {
    citationToReplacement[citation] = `[${index + 1}]`;
  });

  return unorderedSummary.replace(
    /\[\d+\]/g,
    (match) => citationToReplacement[match]
  );
};
