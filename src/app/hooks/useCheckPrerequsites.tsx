import { useEffect, useState } from "react";
import { useUser } from "./useUser";
import { useRouter } from "next/navigation";

export const useCheckPrequisites = () => {
  const router = useRouter();
  const { currentUser } = useUser();

  useEffect(() => {
    if (!currentUser) {
      router.push("/");
    }

    if (
      !currentUser?.vectaraCustomerId ||
      !currentUser?.vectaraPersonalApiKey
    ) {
      router.push("/me");
    }
  }, [
    currentUser,
    currentUser?.vectaraCustomerId,
    currentUser?.vectaraPersonalApiKey,
  ]);
};
