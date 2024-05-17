"use client";

import { Inter } from "next/font/google";
import "./globals.css";
import {
  Badge,
  Box,
  ChakraProvider,
  Flex,
  ListItem,
  Text,
  UnorderedList,
} from "@chakra-ui/react";
import { RecoilRoot } from "recoil";
import { useUser } from "./hooks/useUser";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { LogoutIcon } from "./icons/Logout";
import Link from "next/link";
import { VectaraLogo } from "./icons/Logo";
import { EmailIcon } from "@chakra-ui/icons";
import { useUserGroupInvitations } from "./hooks/useUserGroupInvitations";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <title>Project Portal - Vectara</title>
        <link href="/main.css" rel="stylesheet" />
      </head>
      <body className={inter.className}>
        <ChakraProvider>
          <RecoilRoot>
            <App>{children}</App>
          </RecoilRoot>
        </ChakraProvider>
      </body>
    </html>
  );
}

const App = ({ children }: { children: React.ReactNode }) => {
  const { loadCurrentUser, currentUser } = useUser();

  useEffect(() => {
    const doAsync = async () => await loadCurrentUser();
    doAsync();
  }, []);

  return (
    <Flex
      background="linear-gradient(180deg, hsla(0, 0%, 30%, 1) 0%, hsla(0, 0%, 20%, 1) 55%, hsla(0, 0%, 10%, 1) 100%)"
      fontFamily="Montserrat"
      direction="column"
      height="100%"
      left={0}
      overflow="auto"
      position="fixed"
      top={0}
      width="100%"
    >
      {currentUser && <Header />}

      {children}
    </Flex>
  );
};

const Header = () => {
  const pathName = usePathname();
  const { currentUser } = useUser();
  const [displayType, setDisplayType] = useState<"none" | "flex">("none");
  const isPortalPath = pathName?.match(/^\/portal\/(?!.*create)/);
  const { getInvitations } = useUserGroupInvitations();
  const [pendingInvitationsCount, setPendingInvitationsCount] =
    useState<number>(0);

  useEffect(() => {
    const doAsync = async () => {
      const invitations = await getInvitations();
      setPendingInvitationsCount(invitations.length);
    };
    doAsync();
  }, []);

  useEffect(() => {
    setDisplayType(currentUser === null ? "none" : "flex");
  }, [currentUser]);

  if (isPortalPath) {
    return null;
  }

  return (
    <Flex style={{ ...headerStyles, display: displayType }} gap="1rem">
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
              <a aria-label="Log out" href="/api/auth/logout">
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
