"use client";

import { Page } from "../components/Page";
import { PortalData, PortalType } from "../types";
import { usePortals } from "./usePortals";
import {
  Box,
  Fade,
  Flex,
  Heading,
  Input,
  Select,
  Spinner,
  Text,
} from "@chakra-ui/react";
import Link from "next/link";
import { CSSProperties, ChangeEvent, useEffect, useState } from "react";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import { LoadingMessage } from "../portal/[id]/LoadingMessage";
import { NAVIGATE_PORTALS } from "../analytics";
import { useAmplitude } from "amplitude-react";

const Portals = () => {
  return (
    <Page
      pageId="portals"
      accessPrerequisites={{ loggedInUser: true, vectaraCredentials: true }}
    >
      <Content />
    </Page>
  );
};

const Content = () => {
  const { portals, isLoading } = usePortals();
  const [filters, setFilters] = useState<FilterData | null>(null);
  const { logEvent } = useAmplitude();

  useEffect(() => {
    logEvent(NAVIGATE_PORTALS);
  }, []);

  const onFilter = (filterData: FilterData) => {
    setFilters(filterData);
  };

  let filteredPortalDatas = portals;

  if (filters) {
    filteredPortalDatas = portals.filter((portalData) => {
      const isTextMatch =
        portalData.name.toLowerCase().match(filters.text) ||
        portalData.description?.toLowerCase().match(filters.text);
      const isTypeMatch = filters.type
        ? portalData.type === filters.type
        : true;
      const isIsRestrictedMatch = filters.isRestricted
        ? portalData.isRestricted === filters.isRestricted
        : true;

      return isTextMatch && isTypeMatch && isIsRestrictedMatch;
    });
  }

  return (
    <Flex
      alignItems="center"
      width="100%"
      direction="column"
      position="relative"
    >
      <LoadingMessage show={isLoading} />
      <Fade
        in={!isLoading}
        style={{
          position: "absolute",
          zIndex: "100",
          width: "100%",
          padding: "2rem",
          height: "100%",
        }}
      >
        {portals.length ? (
          <Flex direction="column" width="100%" gap="1rem" height="100%">
            <Heading
              style={{ fontFamily: "Montserrat" }}
              size="lg"
              color="#ddd"
              fontWeight={400}
            >
              Your Portals
            </Heading>
            <Filters onFilter={onFilter} />
            <Box
              background="#242424"
              border="1px solid #888"
              borderRadius=".5rem"
              flexGrow={1}
              overflow="scroll"
              padding="1rem"
            >
              <ResponsiveMasonry
                columnsCountBreakPoints={{ 350: 1, 750: 2, 900: 3 }}
              >
                <Masonry gutter=".75rem">
                  {filteredPortalDatas.map((portalData, index) => (
                    <PortalCard
                      key={`portal-data-${index}`}
                      portalData={portalData}
                    />
                  ))}
                </Masonry>
              </ResponsiveMasonry>
            </Box>
          </Flex>
        ) : (
          <>
            <Flex
              alignItems="center"
              borderRadius=".5rem"
              direction="column"
              overflow="auto"
              maxHeight="500px"
              padding="1rem"
              gap="1rem"
            >
              <Text color="#ddd">{"You don't have any portals yet."}</Text>
              <Link href="/portal/create">
                <Text color="blue.500" fontWeight={500}>
                  Create your first one
                </Text>
              </Link>
            </Flex>
          </>
        )}
      </Fade>
    </Flex>
  );
};

type FilterData = {
  text: string;
  type: PortalType | null;
  isRestricted: boolean | null;
};

interface FiltersProps {
  onFilter: (filterData: FilterData) => void;
}

const Filters = ({ onFilter }: FiltersProps) => {
  const [filters, setFilters] = useState<FilterData>({
    text: "",
    type: null,
    isRestricted: null,
  });

  useEffect(() => onFilter(filters), [filters]);

  return (
    <Flex gap=".5rem" color="#fff" alignItems="center">
      <Text fontWeight={500}>Filter: </Text>
      <Input
        background="#242424"
        fontSize=".8rem"
        size="sm"
        maxWidth="200px"
        border="1px solid #888"
        borderRadius=".25rem"
        padding=".25rem .5rem"
        value={filters.text}
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          setFilters((prev) => ({
            ...prev,
            text: e.target.value.toLowerCase(),
          }))
        }
      />
      <Select
        fontSize=".8rem"
        border="1px solid #888"
        borderRadius=".25rem"
        onChange={(e: ChangeEvent<HTMLSelectElement>) =>
          setFilters((prev) => ({
            ...prev,
            type:
              e.target.value === "all" ? null : (e.target.value as PortalType),
          }))
        }
        value={filters.type ?? "all"}
        size="sm"
        maxWidth="150px"
      >
        <option value="all">All Types</option>
        <option value="search">Search</option>
        <option value="summary">Summary</option>
        <option value="chat">Chat</option>
      </Select>
      <Select
        fontSize=".8rem"
        border="1px solid #888"
        borderRadius=".25rem"
        // TODO: Change this icky ternary
        value={
          filters.isRestricted === null
            ? "all"
            : filters.isRestricted === true
            ? "private"
            : "public"
        }
        onChange={(e: ChangeEvent<HTMLSelectElement>) =>
          setFilters((prev) => ({
            ...prev,
            isRestricted:
              e.target.value === "all" ? null : e.target.value === "private",
          }))
        }
        size="sm"
        maxWidth="150px"
      >
        <option value="all">All Permissions</option>
        <option value="public">Public</option>
        <option value="private">Private</option>
      </Select>
    </Flex>
  );
};

interface PortalCardProps {
  portalData: PortalData;
}

const PortalCard = ({ portalData }: PortalCardProps) => {
  return (
    <Link href={`portal/${portalData.portalKey}`} target="_blank">
      <Flex
        background="#333"
        border="1px solid #888"
        borderRadius=".5rem"
        color="#ddd"
        direction="column"
        gap=".5rem"
        padding="1rem"
        _hover={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}
      >
        <Text fontWeight={500} borderBottom="1px solid #888">
          {portalData.name}
        </Text>
        <Text fontSize=".8rem" fontWeight={400}>
          {portalData.description ?? <em>No description provided</em>}
        </Text>
        <Flex
          alignItems="center"
          justifyContent="flex-end"
          gap=".5rem"
          width="100%"
        >
          <DetailBadge label={portalData.type} />
          <DetailBadge
            label={portalData.isRestricted ? "private" : "public"}
            color={portalData.isRestricted ? "red" : "green"}
          />
        </Flex>
      </Flex>
    </Link>
  );
};

const DetailBadge = ({
  label,
  color = "neutral",
}: {
  label: string;
  color?: "red" | "green" | "neutral";
}) => {
  const bgColors = {
    red: "rgb(100, 0, 0)",
    green: "rgb(0, 100, 0)",
    neutral: "#444",
  };

  const borderColors = {
    red: "rgb(140, 0, 0)",
    green: "rgb(0, 140, 0)",
    neutral: "#888",
  };
  return (
    <Box
      background={bgColors[color]}
      border={`1px solid ${borderColors[color]}`}
      borderRadius=".25rem"
      padding=".125rem .25rem"
    >
      <Text fontSize=".7rem" fontWeight={600}>
        {label}
      </Text>
    </Box>
  );
};

export default Portals;
