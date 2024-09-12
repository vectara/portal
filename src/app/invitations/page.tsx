"use client";

import {
  Badge,
  Flex,
  Heading,
  IconButton,
  Spinner,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import { Page } from "../components/Page";
import { CheckIcon, CloseIcon } from "@chakra-ui/icons";
import { useUserGroupInvitations } from "../hooks/useUserGroupInvitations";
import { useEffect, useState } from "react";
import * as amplitude from '@amplitude/analytics-browser';
import { NAVIGATE_INVITATIONS } from "../analytics";

const Invitations = () => {

  useEffect(() => {
    amplitude.track(NAVIGATE_INVITATIONS);
  }, []);

  return (
    <Page pageId="profile" accessPrerequisites={{ loggedInUser: true }}>
      <Flex padding="2rem" w="100%">
        <Flex direction="column" gap="1.25rem" style={panelStyles}>
          <Heading
            size="lg"
            fontWeight={400}
            color="#ddd"
            style={{ fontFamily: "Montserrat" }}
          >
            Your Invitations
          </Heading>
          <Content />
        </Flex>
      </Flex>
    </Page>
  );
};

const panelStyles = {
  backgroundColor: "#242424",
  borderRadius: "1rem",
  padding: "2rem 2.5rem",
  border: "1px solid #555",
  color: "#ddd",
  overflow: "auto",
  width: "100%",
};

type Invitation = {
  id: number;
  from: string;
};

const Content = () => {
  const [invitations, setInvitations] = useState<Array<Invitation> | undefined>(
    undefined
  );
  const { getInvitations, acceptInvitation, rejectInvitation } =
    useUserGroupInvitations();

  useEffect(() => {
    const doAsync = async () => {
      setInvitations(await getInvitations());
    };
    doAsync();
  }, []);

  if (invitations === undefined) {
    return <Spinner />;
  }

  if (invitations.length === 0) {
    return <Text>{"You haven't received any invitations."}</Text>;
  }

  return (
    <>
      <Text>
        {
          "Accept an invitation to gain access to the inviter's restricted portals."
        }
      </Text>
      <TableContainer
        border="1px solid #888"
        borderRadius=".375rem"
        width="33%"
        minWidth="500px"
      >
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th color="#fff">From</Th>
              <Th color="#fff">Accept / Reject</Th>
            </Tr>
          </Thead>
          <Tbody>
            {invitations.map((invitation: Invitation, index: number) => (
              <Invitation
                key={`invitation-${invitation.id}`}
                fromEmail={invitation.from}
                onAccept={() => acceptInvitation(invitation.id)}
                onReject={() => rejectInvitation(invitation.id)}
              />
            ))}
          </Tbody>
        </Table>
      </TableContainer>
    </>
  );
};

const Invitation = ({
  fromEmail,
  onAccept,
  onReject,
}: {
  fromEmail: string;
  onAccept: () => void;
  onReject: () => void;
}) => {
  const [isAccepting, setIsAccepting] = useState<boolean>(false);
  const [isRejecting, setIsRejecting] = useState<boolean>(false);
  const [isAccepted, setIsAccepted] = useState<boolean>(false);
  const [isRejected, setIsRejected] = useState<boolean>(false);

  let actionContent = (
    <>
      <IconButton
        aria-label={`Accept invitation from ${fromEmail}`}
        icon={<CheckIcon />}
        colorScheme="green"
        size="xs"
        onClick={async () => {
          setIsAccepting(true);
          try {
            await onAccept();
            setIsAccepted(true);
          } catch {}
          setIsAccepting(false);
        }}
        isLoading={isAccepting}
        isDisabled={isRejecting}
      />
      <IconButton
        aria-label={`Reject invitation from ${fromEmail}`}
        icon={<CloseIcon />}
        colorScheme="red"
        size="xs"
        onClick={async () => {
          setIsRejecting(true);
          try {
            await onReject();
            setIsRejected(true);
          } catch {}

          setIsRejecting(false);
        }}
        isLoading={isRejecting}
        isDisabled={isAccepting}
      />
    </>
  );

  if (isRejected || isAccepted) {
    actionContent = (
      <Badge colorScheme={isRejected ? "red" : "green"} padding="0 .5rem">
        {isRejected ? "REJECTED" : "ACCEPTED"}
      </Badge>
    );
  }

  return (
    <Tr>
      <Td padding=".5rem 0 .5rem 1.5rem">{fromEmail}</Td>

      <Td padding=".5rem 1.5rem .5rem 1.5rem">
        <Flex gap=".25rem">{actionContent}</Flex>
      </Td>
    </Tr>
  );
};

export default Invitations;
