import {
  Box,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  ListItem,
  Text,
  UnorderedList,
  Button as ChakraButton,
} from "@chakra-ui/react";
import { PortalData } from "../../types";
import {
  CSSProperties,
  ChangeEvent,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useSearch } from "@vectara/react-search/lib/useSearch";

import { DeserializedSearchResult } from "@vectara/react-search/lib/types";

import debounce from "debounce";
import Link from "next/link";
import { ConfigDrawer } from "../../components/ConfigDrawer";
import { Button } from "../../components/Button";
import { GearIcon } from "../../icons/Gear";

import { FileUploader } from "react-drag-drop-files";
import { usePortal } from "./usePortal";
import { useFileUpload } from "../../hooks/useFileUpload";
import { useFileUploadNotification } from "../../hooks/useFileUploadNotification";
import { CloseIcon } from "@vectara/react-search";
import { ManagementPanel } from "../../components/ManagementPanel";
import { useUser } from "../../hooks/useUser";

interface ParsedSearchResult extends Pick<DeserializedSearchResult, "snippet"> {
  title: string;
  url?: string;
}

const parseSearchResults = (
  searchResults: DeserializedSearchResult[]
): ParsedSearchResult[] => {
  return searchResults.reduce((acc: ParsedSearchResult[], searchResult) => {
    acc.push({
      title: searchResult.title ?? "",
      snippet: searchResult.snippet,
      url: searchResult.url,
    });

    return acc;
  }, []);
};

export const Search = (props: PortalData) => {
  const [didInitiateSearch, setDidInitiateSearch] = useState<boolean>(false);
  const [searchResults, setSearchResults] = useState<
    ParsedSearchResult[] | null
  >();
  useFileUploadNotification();
  const [isManagementOpen, setIsManagementOpen] = useState<boolean>(false);
  const { fetchSearchResults, isLoading } = useSearch(
    props.ownerVectaraCustomerId,
    props.vectaraCorpusId,
    props.vectaraQueryApiKey
  );

  const { currentUser } = useUser();

  const [portalName, setPortalName] = useState<string>(props.name);

  const onSearch = useCallback(
    debounce(async (value: string) => {
      const results = await fetchSearchResults(value);

      setSearchResults(parseSearchResults(results));
    }, 500),
    []
  );

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.value.length < 3) {
      setDidInitiateSearch(false);
      return;
    }

    setDidInitiateSearch(true);
    setSearchResults(null);
    onSearch(e.target.value);
  };

  console.log("### CURRENT", currentUser);

  return (
    <Flex style={getWrapperStyles(didInitiateSearch)} gap={4}>
      <Flex direction="column" gap="2rem" align="center">
        <Flex
          direction="column"
          gap="1.25rem"
          align="center"
          style={searchPanelStyles}
        >
          <Heading size="md">{portalName}</Heading>
          <Flex
            as="form"
            style={searchFormStyles}
            direction="column"
            gap=".5rem"
          >
            <Input
              style={inputStyles}
              placeholder="Search..."
              onChange={onChange}
            />
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
        {searchResults && didInitiateSearch && (
          <UnorderedList style={searchResultsStyles}>
            {searchResults?.map((searchResult, index) => (
              <SearchResult key={`search-results-${index}`} {...searchResult} />
            ))}
          </UnorderedList>
        )}
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

const SearchResult = (props: ParsedSearchResult) => {
  const content = (
    <ListItem as="li" style={searchResultStyles}>
      <Heading size="xs">{props.title}</Heading>
      <Text size="sm">
        {props.snippet.pre}
        {props.snippet.text}
        {props.snippet.post}
      </Text>
      {props.url && (
        <Text fontSize=".8rem" fontWeight={700}>
          {props.url}
        </Text>
      )}
    </ListItem>
  );

  if (!props.url) return content;
  return (
    <Link href={props.url} target="_blank">
      <Box
        cursor="pointer"
        _hover={{ backgroundColor: "rgba(255, 255, 255, 0.2)" }}
      >
        {content}
      </Box>
    </Link>
  );
};

const getWrapperStyles = (didInitiateSearch: boolean) =>
  ({
    alignItems: didInitiateSearch ? "initial" : "center",
    flexDirection: "column",
    height: "100%",
    justifyContent: didInitiateSearch ? "initial" : "center",
    width: "100%",
    color: "#ddd",
    padding: "1rem",
  } as CSSProperties);

const searchFormStyles = {
  maxWidth: "500px",
  minWidth: "360px",
  width: "75%",
};

const inputStyles = {
  border: "1px solid #aaa",
};

const searchResultsStyles = {
  display: "flex",
  flexDirection: "column",
  gap: ".75rem",
  listStyleType: "none",
  margin: 0,
  width: "75%",
  maxWidth: "800px",
  paddingBottom: "4rem",
} as CSSProperties;

const searchResultStyles = {
  display: "flex",
  flexDirection: "column",
  gap: ".75rem",
  padding: "1.5rem",
  borderBottom: "1px solid #555",
} as CSSProperties;

const searchPanelStyles = {
  backgroundColor: "#242424",
  borderRadius: "1rem",
  padding: "1.5rem 1rem",
  width: "600px",
  border: "1px solid #555",
};
