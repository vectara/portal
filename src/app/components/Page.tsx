import {
  Box,
  ChakraProvider,
  Fade,
  Flex,
  ListItem,
  Text,
  UnorderedList,
  useToast,
} from "@chakra-ui/react";
import { CSSProperties, ReactNode, useEffect, useState } from "react";
import { VectaraLogo } from "../icons/Logo";
import Link from "next/link";
import { RecoilRoot } from "recoil";
import { LogoutIcon } from "../icons/Logout";
import { useUser } from "../hooks/useUser";
import { useRouter } from "next/navigation";
import {
  PagePrerequisites,
  useCheckPrequisites,
} from "../hooks/useCheckPrerequisites";

type PageId = "login" | "profile" | "portals" | "portal" | "create";

interface NavigationProps {
  pageId: PageId;
}

interface PageProps extends NavigationProps {
  pageId: PageId;
  accessPrerequisites?: PagePrerequisites;
  children?: ReactNode;
}

const HEADERLESS_PAGE_IDS = ["login", "portal", "signup"];

export const Page = ({ pageId, children, accessPrerequisites }: PageProps) => {
  const [didEnter, setDidEnter] = useState<boolean>(false);
  const { canAccess } = useCheckPrequisites(accessPrerequisites);

  useEffect(() => {
    window.setTimeout(() => setDidEnter(true), 300);
  }, []);

  return (
    <Flex style={pageStyles} direction="column">
      {canAccess && (
        <>
          {HEADERLESS_PAGE_IDS.indexOf(pageId) === -1 && (
            <Header pageId={pageId} />
          )}
          <Flex alignItems="center" justifyContent="center" h="100%">
            <Fade
              in={didEnter}
              className="test"
              style={{ width: "100%", height: "100%" }}
            >
              <Flex w="100%" h="100%" justifyContent="center">
                {children}
              </Flex>
            </Fade>
          </Flex>
        </>
      )}
    </Flex>
  );
};

const Header = ({ pageId }: NavigationProps) => {
  const { currentUser } = useUser();
  const router = useRouter();
  const [displayType, setDisplayType] = useState<"none" | "flex">("none");

  useEffect(() => {
    setDisplayType(currentUser === null ? "none" : "flex");
  }, [currentUser]);

  return (
    <Flex style={{ ...headerStyles, display: displayType }} gap="1rem">
      <Flex gap=".5rem" alignItems="center" fontWeight={500}>
        <VectaraLogo />
        <Text>PORTAL</Text>
      </Flex>
      <UnorderedList style={navigationStyles}>
        <ListItem
          style={getNavItemStyles({ isSelected: pageId === "portals" })}
        >
          <Link href="/portals">Your Portals</Link>
        </ListItem>
        <ListItem style={getNavItemStyles({ isSelected: pageId === "create" })}>
          <Link href="/portal/create">Create a Portal</Link>
        </ListItem>
        <ListItem
          style={getNavItemStyles({ isSelected: pageId === "profile" })}
        >
          <Link href="/me">Your Profile</Link>
        </ListItem>
        <ListItem display="flex" flexGrow={1}>
          <Box style={logoutStyles}>
            <LogoutIcon />
            <Box>
              <a href="/api/auth/logout">Log Out</a>
            </Box>
          </Box>
        </ListItem>
      </UnorderedList>
    </Flex>
  );
};

// TODO: Convert all to prop styles
const pageStyles = {
  background:
    "linear-gradient(180deg, hsla(0, 0%, 30%, 1) 0%, hsla(0, 0%, 20%, 1) 55%, hsla(0, 0%, 10%, 1) 100%)",
  fontFamily: '"Montserrat", sans-serif',
  height: "100%",
  left: 0,
  overflow: "auto",
  position: "fixed",
  top: 0,
  width: "100%",
} as CSSProperties;

const navigationStyles = {
  display: "flex",
  gap: "1rem",
  listStyleType: "none",
  width: "100%",
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
