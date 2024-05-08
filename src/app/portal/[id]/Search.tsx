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
import { ChangeEvent, KeyboardEvent, useCallback, useState } from "react";
import { useSearch } from "@vectara/react-search/lib/useSearch";
import { DeserializedSearchResult } from "@vectara/react-search/lib/types";
import debounce from "debounce";
import Link from "next/link";
import { useFileUploadNotification } from "../../hooks/useFileUploadNotification";

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
  const { fetchSearchResults, isLoading } = useSearch(
    props.vectaraCustomerId,
    props.vectaraCorpusId,
    props.vectaraApiKey
  );

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
    <>
      <Flex as="form" direction="column" gap=".5rem" width="100%">
        <Flex alignItems="center" gap=".5rem">
          <Input
            border="1px solid #aaa"
            maxWidth="500px"
            placeholder="Search..."
            onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
              if (e.key === "Enter") {
                onSearch((e.target as HTMLInputElement).value);
                e.preventDefault();
              }
            }}
            onChange={onChange}
          />
          {isLoading && <Spinner color="#888" size="sm" />}
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
              <SearchResult key={`search-results-${index}`} {...searchResult} />
            ))}
          </UnorderedList>
        )}
      </Box>
    </>
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
