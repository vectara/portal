import { useState, useEffect } from "react";
import { useUser } from "./useUser";
import { useRouter } from "next/navigation";
import { useToast } from "@chakra-ui/react";

export type PagePrerequisites = {
  loggedInUser?: boolean;
  vectaraCredentials?: boolean;
};

export const useCheckPrequisites = (prereqs?: PagePrerequisites) => {
  const {
    loggedInUser: shouldVerifyLoggedInUser,
    vectaraCredentials: shouldVerifyVectaraCredentials,
  } = prereqs ?? {};
  const router = useRouter();
  const { currentUser } = useUser();
  const toast = useToast();

  // If no prereqs are defined, instantly allow access.
  const [canAccess, setCanAccess] = useState<boolean | undefined>(
    prereqs === undefined ? true : undefined
  );

  useEffect(() => {
    let accessCheck = true;

    if (currentUser === undefined) {
      return;
    }

    // Check the logged in user.
    if (shouldVerifyLoggedInUser) {
      accessCheck = !!currentUser;
    } else {
      router.push("/");
    }

    // Check Vectara credentials.
    if (shouldVerifyVectaraCredentials) {
      accessCheck =
        !!currentUser?.vectaraCustomerId &&
        !!currentUser?.vectaraPersonalApiKey;

      if (!accessCheck) {
        router.push("/me");
        toast({
          title: "We need a few more things to get you started.",
          description:
            "To take full advantage of Portal, please add your Vectara Customer ID and Personal API key. You can find this info in your Vectara account.",
          status: "info",
          duration: 10000,
          isClosable: true,
          position: "top",
        });
      }
    }
    setCanAccess(accessCheck);
  }, [currentUser?.id]);

  return { canAccess };
};
