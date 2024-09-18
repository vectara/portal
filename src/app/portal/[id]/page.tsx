"use client";

import { Fade, Text, useToast } from "@chakra-ui/react";
import { Page } from "../../components/Page";
import { ReactNode, useEffect, useState } from "react";
import { usePortal } from "./usePortal";
import { PortalData, PortalType } from "../../types";
import { Search } from "./Search";
import { Summary } from "./Summary";
import { Chat } from "./Chat";
import { PortalPanel } from "./PortalPanel";
import { PortalWrapper } from "./PortalWrapper";
import { PortalHeader } from "./PortalHeader";
import { ConfigDrawer } from "@/app/components/ConfigDrawer";
import { ManagementPanel } from "@/app/components/ManagementPanel";
import { GearIcon } from "@/app/icons/Gear";
import { Button } from "@/app/components/Button";
import { useUser } from "@/app/hooks/useUser";
import { FaShareSquare } from "react-icons/fa";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { LoadingMessage } from "./LoadingMessage";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as amplitude from '@amplitude/analytics-browser';
import { ACTION_SHARE_PORTAL, NAVIGATE_PORTAL } from "@/app/analytics";

const Portal = ({ params }: any) => {
  const { getPortal } = usePortal();
  const [portalData, setPortalData] = useState<PortalData | null | undefined>(
    undefined
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isManagementOpen, setIsManagementOpen] = useState<boolean>(false);
  const { id: portalId } = params;
  const { currentUser } = useUser();
  const userIsOwner = currentUser?.id === portalData?.ownerId;
  const toast = useToast();
  const [url, setUrl] = useState<string>("");
  const [userIsAuthorized, setUserIsAuthorized] = useState<boolean | undefined>(
    undefined
  );

  const pathname = usePathname();

  useEffect(() => {
    amplitude.track(NAVIGATE_PORTAL, { portalId });
  }, []);

  useEffect(() => {
    setUrl(window.location.href);
  }, []);

  useEffect(() => {
    const doAsync = async () => {
      if (!portalId) {
        return;
      }
      const portalDataWithPrivilege = await getPortal(portalId);

      window.setTimeout(() => {
        setUserIsAuthorized(portalDataWithPrivilege.isAuthorized);
        setPortalData(portalDataWithPrivilege.data);
        setIsLoading(false);
      }, 2000);
    };

    doAsync();
  }, [portalId]);

  const PortalComponent = portalData
    ? PORTAL_TYPE_TO_COMPONENT[portalData.type as PortalType]
    : null;

  const headerButtons = [
    <CopyToClipboard
      key="copy-to-clipboard"
      text={url}
      onCopy={() => {
        amplitude.track(ACTION_SHARE_PORTAL, {
          portalKey: portalData?.portalKey,
          type: portalData?.type,
        });
        toast({
          title: "Portal URL copied to clipboard!",
          status: "success",
          duration: 5000,
        });
      }}
    >
      <Button
        hasBorder={false}
        icon={<FaShareSquare />}
        onClick={() => {
          /* noop */
        }}
        size="s"
      />
    </CopyToClipboard>,
  ];

  if (userIsOwner) {
    headerButtons.push(
      <Button
        key="manage-button"
        hasBorder={false}
        icon={<GearIcon />}
        onClick={() => setIsManagementOpen(true)}
        size="s"
      />
    );
  }

  let content;

  if (userIsAuthorized === false) {
    content = (
      <PortalWrapper>
        <Text>Portal requires authorization.</Text>
        {!currentUser && (
          <Text>
            You may need to{" "}
            <Link href={`/api/auth/login?returnTo=${pathname}`}>
              <Text as="span" color="blue.500" fontWeight={500}>
                log in
              </Text>
            </Link>{" "}
            to verify access.
          </Text>
        )}
      </PortalWrapper>
    );
  } else if (portalData === null) {
    content = (
      <PortalWrapper>
        <Text>Portal not found</Text>
      </PortalWrapper>
    );
  } else if (portalData === undefined) {
    content = <></>;
  } else {
    content = (
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
    );
  }

  return (
    <Page pageId="portal">
      <LoadingMessage show={isLoading} />

      <Fade
        in={portalData !== undefined}
        style={{
          height: "100%",
          width: "100%",
          zIndex: "100",
        }}
      >
        {content}
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
