import {
  Box,
  Fade,
  Flex,
  ListItem,
  Text,
  UnorderedList,
} from "@chakra-ui/react";
import { CSSProperties, ReactNode, useEffect, useState } from "react";
import { VectaraLogo } from "../icons/Logo";
import Link from "next/link";
import { LogoutIcon } from "../icons/Logout";
import { useUser } from "../hooks/useUser";
import { useRouter } from "next/navigation";
import {
  PagePrerequisites,
  useCheckPrequisites,
} from "../hooks/useCheckPrerequisites";

type PageId = "login" | "profile" | "portals" | "portal" | "create";

interface PageProps {
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
    <>
      {canAccess && (
        <>
          <Flex alignItems="center" justifyContent="center" h="100%">
            <Fade
              in={didEnter}
              className="test"
              style={{
                width: "100%",
                height: "100%",
              }}
            >
              <Flex w="100%" h="100%" justifyContent="center">
                {children}
              </Flex>
            </Fade>
          </Flex>
        </>
      )}
    </>
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
