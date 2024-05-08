import {
  Box,
  Flex,
  Heading,
  Input,
  ListItem,
  Spinner,
  Text,
  UnorderedList,
} from "@chakra-ui/react";
import { PortalData } from "../../types";
import { CSSProperties, ChangeEvent, useCallback, useState } from "react";
import { useSearch } from "@vectara/react-search/lib/useSearch";

import { DeserializedSearchResult } from "@vectara/react-search/lib/types";

import debounce from "debounce";
import Link from "next/link";
import { ConfigDrawer } from "../../components/ConfigDrawer";
import { Button } from "../../components/Button";
import { GearIcon } from "../../icons/Gear";
import { useFileUploadNotification } from "../../hooks/useFileUploadNotification";
import { ManagementPanel } from "../../components/ManagementPanel";
import { useUser } from "../../hooks/useUser";
import { PortalPanel } from "./PortalPanel";
import { PortalWrapper } from "./PortalWrapper";
import { PortalHeader } from "./PortalHeader";

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
  const [searchResults, setSearchResults] = useState<
    ParsedSearchResult[] | null
  >();
  useFileUploadNotification();
  const [isManagementOpen, setIsManagementOpen] = useState<boolean>(false);
  const { fetchSearchResults, isLoading } = useSearch(
    props.vectaraCustomerId,
    props.vectaraCorpusId,
    props.vectaraApiKey
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
      setSearchResults(null);
      return;
    }

    setSearchResults(null);
    onSearch(e.target.value);
  };

  return (
    <PortalWrapper>
      <PortalPanel>
        <PortalHeader name={portalName} type="search" />
        <Flex as="form" direction="column" gap=".5rem" width="100%">
          <Flex alignItems="center" gap=".5rem">
            <Input
              border="1px solid #aaa"
              maxWidth="500px"
              placeholder="Search..."
              onChange={onChange}
            />
            {isLoading && <Spinner color="#888" size="sm" />}
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
        <Box
          overflow="scroll"
          width="100%"
          borderTop={searchResults ? "1px solid #888" : undefined}
        >
          {searchResults && (
            <UnorderedList
              display="flex"
              flexDirection="column"
              gap=".75rem"
              listStyleType="none"
              margin={0}
              padding="1rem 0"
            >
              {searchResults?.map((searchResult, index) => (
                <SearchResult
                  key={`search-results-${index}`}
                  {...searchResult}
                />
              ))}
            </UnorderedList>
          )}
        </Box>
      </PortalPanel>

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
    </PortalWrapper>
  );
};

const SearchResult = (props: ParsedSearchResult) => {
  const content = (
    <ListItem
      as="li"
      display="flex"
      flexDirection="column"
      gap=".25rem"
      padding="1rem"
      border="1px solid #555"
      borderRadius=".5rem"
    >
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
