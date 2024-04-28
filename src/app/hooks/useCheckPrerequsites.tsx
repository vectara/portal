import { useEffect, useState } from "react";
import { useUser } from "./useUser";
import { useRouter } from "next/navigation";

export const useCheckPrequisites = (verifyVectaraCredentials = true) => {
  const router = useRouter();
  const { currentUser } = useUser();

  useEffect(() => {
    if (currentUser === undefined) {
      return;
    }

    if (currentUser === null) {
      router.push("/");
    }

    if (verifyVectaraCredentials) {
      if (
        !currentUser?.vectaraCustomerId ||
        !currentUser?.vectaraPersonalApiKey
      ) {
        router.push("/me");
      }
    }
  }, [
    currentUser,
    currentUser?.vectaraCustomerId,
    currentUser?.vectaraPersonalApiKey,
  ]);
};
