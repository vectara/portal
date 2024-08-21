"use client";

import {
  Badge,
  Box,
  Flex,
  ListItem,
  Text,
  UnorderedList,
} from "@chakra-ui/react";
import { usePathname } from "next/navigation";
import { useUser } from "../hooks/useUser";
import { useUserGroupInvitations } from "../hooks/useUserGroupInvitations";
import { suspend } from "suspend-react";
import { VectaraLogo } from "../icons/Logo";
import Link from "next/link";
import { EmailIcon } from "@chakra-ui/icons";
import { LogoutIcon } from "../icons/Logout";
import { ACTION_LOG_OUT } from "../analytics";
import { useAmplitude } from "amplitude-react";

export const Header = () => {
  const pathName = usePathname();
  const { currentUser } = useUser();
  const isPortalPath = pathName?.match(/^\/portal\/(?!.*create)/);
  const { getInvitations } = useUserGroupInvitations();
  const { logEvent, resetIdentity } = useAmplitude();
  const invitations = suspend(() => getInvitations(), ["invitations"]);
  const pendingInvitationsCount = invitations.length;

  if (isPortalPath) {
    return null;
  }

  return (
    <Flex
      style={{ ...headerStyles, display: currentUser ? "flex" : "none" }}
      gap="1rem"
    >
      <Flex gap=".5rem" alignItems="center" fontWeight={500}>
        <VectaraLogo />
        <Text>PORTAL</Text>
      </Flex>
      <UnorderedList style={navigationStyles}>
        <ListItem
          style={getNavItemStyles({ isSelected: pathName === "/portals" })}
        >
          <Link href="/portals">Your Portals</Link>
        </ListItem>
        <ListItem
          style={getNavItemStyles({
            isSelected: pathName === "/portal/create",
          })}
        >
          <Link href="/portal/create">Create a Portal</Link>
        </ListItem>
        <ListItem style={getNavItemStyles({ isSelected: pathName === "/me" })}>
          <Link href="/me">Your Profile</Link>
        </ListItem>
        <ListItem
          display="flex"
          position="relative"
          flexGrow={1}
          justifyContent="flex-end"
        >
          <Link href="/invitations">
            <EmailIcon
              boxSize="1.2rem"
              opacity={pendingInvitationsCount > 0 ? 1 : 0.5}
            />
            {pendingInvitationsCount > 0 && (
              <Badge
                display="flex"
                justifyContent="center"
                position="absolute"
                top="-.125rem"
                right="-.3rem"
                backgroundColor="red.500"
                color="#fff"
                fontSize=".5rem"
              >
                {pendingInvitationsCount}
              </Badge>
            )}
          </Link>
        </ListItem>
        <ListItem display="flex">
          <Box style={logoutStyles}>
            <Box>
              <a
                aria-label="Log out"
                href="/api/auth/logout"
                onClick={() => {
                  logEvent(ACTION_LOG_OUT);
                  resetIdentity();
                }}
              >
                <LogoutIcon />
              </a>
            </Box>
          </Box>
        </ListItem>
      </UnorderedList>
    </Flex>
  );
};

const getNavItemStyles = ({ isSelected }: { isSelected: boolean }) => ({
  textDecoration: isSelected ? "underline" : undefined,
  fontSize: ".95rem",
  cursor: "pointer",
});

const headerStyles = {
  backgroundColor: "#eee",
  borderBottom: "1px solid #bbb",
  padding: ".5rem 1rem",
  alignItems: "center",
};

const logoutStyles = {
  display: "flex",
  alignItems: "center",
  flexGrow: 1,
  fontSize: ".95rem",
  cursor: "pointer",
  gap: ".5rem",
  justifyContent: "flex-end",
};

const navigationStyles = {
  display: "flex",
  gap: "1rem",
  listStyleType: "none",
  width: "100%",
};
