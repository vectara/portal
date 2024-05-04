"use client";

import { Box, Button, Fade, Flex, Text } from "@chakra-ui/react";
import { Page } from "../../components/Page";
import { CSSProperties, ReactNode, useEffect, useState } from "react";
import { usePortal } from "./usePortal";
import { PortalData, PortalType } from "../../types";
import { Search } from "./Search";
import { Spinner } from "../../components/Spinner";
import { Summary } from "./Summary";
import { Chat } from "./Chat";

const Portal = ({ params }: any) => {
  const { getPortal } = usePortal();
  const [portalData, setPortalData] = useState<PortalData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const { id: portalId } = params;

  useEffect(() => {
    const doAsync = async () => {
      if (!portalId) {
        return;
      }
      const portalData = await getPortal(portalId);

      window.setTimeout(() => {
        setPortalData(portalData);
        setIsLoading(false);
      }, 2000);
    };

    doAsync();
  }, [portalId]);

  const PortalComponent = portalData
    ? PORTAL_TYPE_TO_COMPONENT[portalData.type as PortalType]
    : null;

  return (
    <Page pageId="portal">
      <LoadingMessage show={isLoading} />

      <Fade
        in={!!portalData}
        style={{
          height: "100%",
          width: "100%",
          zIndex: "100",
        }}
      >
        {PortalComponent && portalData && <PortalComponent {...portalData} />}
      </Fade>
    </Page>
  );
};

export default Portal;

const PORTAL_TYPE_TO_COMPONENT: Record<
  PortalType,
  (portalData: PortalData) => ReactNode
> = {
  search: Search,
  summary: Summary,
  chat: Chat,
};

export const LoadingMessage = ({ show }: { show: boolean }) => (
  <Fade in={show}>
    <Flex direction="column" style={loadingMessageStyles}>
      <Spinner />
      <Flex
        textAlign="center"
        position="absolute"
        h="100%"
        w="100%"
        alignItems="center"
        justifyContent="center"
      >
        <Text
          fontSize="1rem"
          fontWeight="500"
          color="#ddd"
          letterSpacing=".1rem"
        >
          LOADING
        </Text>
      </Flex>
    </Flex>
  </Fade>
);

const loadingMessageStyles = {
  position: "absolute",
  left: "calc(50% - 100px)",
  top: "calc(50% - 100px)",
} as CSSProperties;
