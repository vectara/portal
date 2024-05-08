"use client";

import { Fade, Flex, Text } from "@chakra-ui/react";
import { Page } from "../../components/Page";
import { CSSProperties, ReactNode, useEffect, useState } from "react";
import { usePortal } from "./usePortal";
import { PortalData, PortalType } from "../../types";
import { Search } from "./Search";
import { Spinner } from "../../components/Spinner";
import { Summary } from "./Summary";
import { Chat } from "./Chat";
import { PortalPanel } from "./PortalPanel";
import { PortalWrapper } from "./PortalWrapper";
import { PortalHeader } from "./PortalHeader";
import { ConfigDrawer } from "@/app/components/ConfigDrawer";
import { ManagementPanel } from "@/app/components/ManagementPanel";
import { GearIcon } from "@/app/icons/Gear";
import { Button } from "@/app/components/Button";

const Portal = ({ params }: any) => {
  const { getPortal } = usePortal();
  const [portalData, setPortalData] = useState<PortalData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isManagementOpen, setIsManagementOpen] = useState<boolean>(false);

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

  const headerButtons = [
    <Button
      hasBorder={false}
      icon={<GearIcon />}
      onClick={() => setIsManagementOpen(true)}
      size="s"
    />,
  ];

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
        {portalData && (
          <>
            <PortalWrapper>
              <PortalPanel>
                <PortalHeader
                  portalData={portalData}
                  headerButtons={headerButtons}
                />
                {PortalComponent && portalData && (
                  <PortalComponent {...portalData} />
                )}
              </PortalPanel>
            </PortalWrapper>
            <ConfigDrawer
              header="Portal Management"
              isOpen={isManagementOpen}
              onClose={() => setIsManagementOpen(false)}
            >
              <ManagementPanel
                portalData={portalData}
                onClose={() => setIsManagementOpen(false)}
                onSave={(updatedPortalData: PortalData) =>
                  setPortalData(updatedPortalData)
                }
              />
            </ConfigDrawer>
          </>
        )}
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
