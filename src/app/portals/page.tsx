"use client";

import { useEffect, useState } from "react";
import { Page } from "../components/Page";
import { PortalData, PortalType } from "../types";
import { usePortals } from "./usePortals";
import { Fade, Flex, Heading, Text } from "@chakra-ui/react";
import Link from "next/link";
import { LoadingMessage } from "../portal/[id]/page";
import { useUser } from "../hooks/useUser";
import { useCheckPrequisites } from "../hooks/useCheckPrerequsites";

const Portals = () => {
  return (
    <Page pageId="portals">
      <Content />
    </Page>
  );
};

const Content = () => {
  const [portalDatas, setPortalDatas] = useState<Array<PortalData> | null>(
    null
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { getPortals } = usePortals();
  const { currentUser } = useUser();

  useCheckPrequisites();

  useEffect(() => {
    const doAsync = async () => {
      const portalDatas = await getPortals(
        currentUser?.vectaraCustomerId as string
      );

      window.setTimeout(() => {
        setPortalDatas(portalDatas);
        setIsLoading(false);
      }, 2000);
    };

    doAsync();
  }, [currentUser?.vectaraCustomerId]);
  return (
    <Flex
      width="75%"
      justifyContent="center"
      alignItems="center"
      direction="column"
      position="relative"
    >
      <LoadingMessage show={isLoading} />
      <Fade
        in={!isLoading}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "1.5rem",
          position: "absolute",
          zIndex: "100",
        }}
      >
        <Heading size="lg" color="#ddd" fontWeight={200}>
          Select a Portal:
        </Heading>
        <Flex
          background="#242424"
          borderRadius=".5rem"
          direction="column"
          border="1px solid #888"
          overflow="auto"
          maxHeight="500px"
          padding="1rem"
          gap="1rem"
        >
          {portalDatas?.map((portalData, index) => (
            <PortalCard
              key={`portal-data-${index}`}
              name={portalData.name}
              type={portalData.type}
              id={portalData.portalKey}
            />
          ))}
        </Flex>
      </Fade>
    </Flex>
  );
};

interface PortalCardProps {
  name: string;
  type: PortalType;
  id: string;
}

const PortalCard = ({ name, type, id }: PortalCardProps) => {
  return (
    <Link href={`portal/${id}`} target="_blank">
      <Flex
        borderRadius=".5rem"
        color="#ddd"
        direction="column"
        gap=".5rem"
        padding="1.25rem 1rem"
        _hover={{ backgroundColor: "rgba(255, 255, 255, 0.2)" }}
      >
        <Flex alignItems="center" justifyContent="center">
          <Heading fontFamily="Montserrat" size="md" fontWeight={300}>
            {name}
          </Heading>
        </Flex>
        <Flex alignItems="center" justifyContent="center">
          <Text fontSize=".8rem" fontWeight={600}>
            {type}
          </Text>
        </Flex>
      </Flex>
    </Link>
  );
};

export default Portals;
