// For now, we'll only support a single, "default" user group

import {
  Badge,
  Box,
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  Heading,
  IconButton,
  Input,
  Spinner,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import { useUserGroups } from "./useUserGroups";
import {
  CSSProperties,
  ChangeEvent,
  KeyboardEvent,
  useEffect,
  useState,
} from "react";
import { DeleteIcon } from "@chakra-ui/icons";
import { useUserGroup } from "./useUserGroup";
import { useUserGroupInvitations } from "../hooks/useUserGroupInvitations";
import { IoMdRefresh } from "react-icons/io";

interface Props {
  userId: string;
}

type UserGroup = {
  id: string;
  ownerId: string;
  name: string;
};

export const UserGroups = ({ userId }: Props) => {
  const { getUserGroups, inviteUserToGroup } = useUserGroups(userId);
  const [userGroups, setUserGroups] = useState<Array<UserGroup>>([]);
  const [currentUserGroupId, setCurrentUserGroupId] = useState<string | null>(
    null
  );

  useEffect(() => {
    const doAsync = async () => {
      const groups = await getUserGroups();
      setUserGroups(groups);
      if (groups.length) {
        setCurrentUserGroupId(groups[0].id);
      }
    };

    doAsync();
  }, []);

  return (
    <Flex gap="1rem" direction="column" width="33%" minWidth="500px">
      <Heading size="md">Users</Heading>

      {currentUserGroupId && (
        <>
          <UsersTable
            groupId={currentUserGroupId}
            onInvite={inviteUserToGroup}
          />
        </>
      )}
    </Flex>
  );
};

const formControlStyles = {
  display: "flex",
  flexDirection: "column",
} as CSSProperties;

type UserGroupMembership = {
  id: number;
  userId: number;
  groupId: number;
  email: string;
  state: UserGroupMembershipState;
};

type UserGroupMembershipState = "pending" | "accepted" | "rejected" | "revoked";

const UsersTable = ({
  groupId,
  onInvite,
}: {
  groupId: string;
  onInvite: (currentUserGroupId: string, userEmailToAdd: string) => void;
}) => {
  const [userEmailToAdd, setUserEmailToAdd] = useState<string>("");
  const [isSendingInvite, setIsSendingInvite] = useState<boolean>(false);
  const [hasEmailError, setHasEmailError] = useState<boolean>(false);
  const [memberships, setMemberships] = useState<
    Array<UserGroupMembership> | undefined
  >(undefined);
  const { getMemberships } = useUserGroup();
  const { revokeInvitation, resendInvitation } = useUserGroupInvitations();

  const loadMemberships = async () => {
    setMemberships(await getMemberships(groupId));
  };

  useEffect(() => {
    loadMemberships();
  }, [groupId]);

  const onSubmit = async () => {
    const isEmailValid = validateEmail(userEmailToAdd);

    if (!isEmailValid) {
      setHasEmailError(true);
      return;
    }

    try {
      setIsSendingInvite(true);
      await onInvite(groupId, userEmailToAdd);
    } catch {}

    setIsSendingInvite(false);
    setUserEmailToAdd("");

    setMemberships(await getMemberships(groupId));
  };

  if (memberships === undefined) {
    return <Spinner />;
  }

  return (
    <>
      <TableContainer border="1px solid #888" borderRadius=".375rem">
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th color="#fff">Email</Th>
              <Th color="#fff">Status</Th>
              <Th color="#fff"> </Th>
            </Tr>
          </Thead>
          <Tbody>
            {memberships.map((membership: UserGroupMembership) => {
              const onAction = ["accepted", "pending"].includes(
                membership.state
              )
                ? () => revokeInvitation(membership.id)
                : () => resendInvitation(membership.id);
              return (
                <Membership
                  key={`group-user-${membership.email}`}
                  email={membership.email}
                  state={membership.state}
                  onAction={onAction}
                />
              );
            })}
          </Tbody>
        </Table>
      </TableContainer>
      <Box>
        <FormControl style={formControlStyles} isInvalid={hasEmailError}>
          <Flex gap="1rem">
            <Input
              type="text"
              value={userEmailToAdd}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                if (hasEmailError) {
                  setHasEmailError(false);
                }

                setUserEmailToAdd(e.target.value);
              }}
              onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  onSubmit();
                }
              }}
              placeholder="Enter an email address"
              border="1px solid #888"
              minWidth="320px"
            />
            <Button
              padding="0 1.5rem"
              isDisabled={userEmailToAdd === "" || isSendingInvite}
              onClick={() => onSubmit()}
              isLoading={isSendingInvite}
            >
              Send invite
            </Button>
          </Flex>
          <FormErrorMessage fontSize="0.75rem" color="red.500">
            Please enter a valid email.
          </FormErrorMessage>
        </FormControl>
      </Box>
    </>
  );
};

const Membership = ({
  email,
  state,
  onAction,
}: {
  email: string;
  state: UserGroupMembershipState;
  onAction: () => Promise<void>;
}) => {
  const [isPerformingAction, setIsPerformingAction] = useState<boolean>(false);
  const [membershipState, setMembershipState] =
    useState<UserGroupMembershipState>(state);
  const stateToBadgeColorScheme: Record<UserGroupMembershipState, string> = {
    accepted: "green",
    pending: "purple",
    rejected: "red",
    revoked: "red",
  };

  const button = ["accepted", "pending"].includes(membershipState) ? (
    <IconButton
      aria-label="Revoke invitation"
      icon={<DeleteIcon />}
      colorScheme="red"
      size="xs"
      isLoading={isPerformingAction}
      onClick={async () => {
        setIsPerformingAction(true);
        try {
          await onAction();
          setMembershipState("revoked");
        } catch {}
        setIsPerformingAction(false);
      }}
    />
  ) : (
    <IconButton
      aria-label="Resend invitation"
      icon={<IoMdRefresh size="1rem" />}
      colorScheme="green"
      size="xs"
      isLoading={isPerformingAction}
      onClick={async () => {
        setIsPerformingAction(true);
        try {
          await onAction();
          setMembershipState("pending");
        } catch {}

        setIsPerformingAction(false);
      }}
    />
  );

  return (
    <Tr>
      <Td padding=".5rem 0 .5rem 1.5rem">{email}</Td>
      <Td padding=".5rem 0 .5rem 1.5rem">
        <Badge
          colorScheme={stateToBadgeColorScheme[membershipState]}
          padding="0 .5rem"
        >
          {membershipState}
        </Badge>
      </Td>
      <Td padding=".5rem 1.5rem .5rem 1.5rem">{button}</Td>
    </Tr>
  );
};

const validateEmail = (email: string) => {
  return String(email)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
};
