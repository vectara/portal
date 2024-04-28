import axios from "axios";
import { useEffect, useState } from "react";

type CurrentUser = {
  id: number | null;
  email: string | null;
  vectaraCustomerId: string | null;
  vectaraPersonalApiKey: string | null;
  role: string;
};

export const useUser = () => {
  const [currentUser, setCurrentUser] = useState<
    CurrentUser | null | undefined
  >();

  useEffect(() => {
    const doAsync = async () => {
      try {
        const { user } = await getCurrentUser();
        if (user) {
          setCurrentUser({
            id: user.id,
            email: user.email,
            vectaraCustomerId: user.vectara_customer_id,
            vectaraPersonalApiKey: user.vectara_personal_api_key,
            role: user.role,
          });
        }
      } catch {
        setCurrentUser(null);
      }
    };

    doAsync();
  }, []);

  const getCurrentUser = async () => {
    const config = {
      method: "get",
      url: `/api/me`,
    };

    const response = await axios(config);
    return response.data;
  };

  const createUser = async (email: string, password: string) => {
    const config = {
      method: "post",
      maxBodyLength: Infinity,
      url: "/api/user",
      data: {
        email,
        password,
      },
    };

    const response = await axios(config);
    const createdUser = response.data.user
      ? {
          id: response.data.user.id,
          email: response.data.user.email,
          role: response.data.user.role,
          vectaraCustomerId: response.data.user.vectara_customer_id,
          vectaraPersonalApiKey: response.data.user.vectara_personal_api_key,
          sessionToken: response.data.user.sessionToken,
          users_ids: response.data.user.users_ids,
        }
      : null;

    if (createdUser) {
      setCurrentUser(createdUser);
    }
  };

  const getChildUsersIds = async () => {
    const config = {
      maxBodyLength: Infinity,
      url: "/api/user/users",
    };

    const response = await axios(config);

    return response.data;
  };

  const updateUser = async (
    email: string,
    vectaraCustomerId?: string,
    vectaraPersonalApiKey?: string,
    addEmails?: Array<string>
  ) => {
    const response = await axios.patch("/api/user", {
      email,
      vectaraCustomerId,
      vectaraPersonalApiKey,
      addEmails,
    });

    if (response.data.success && currentUser) {
      const updatedUser = await getCurrentUser();
      setCurrentUser({
        ...updatedUser.user,
        vectaraCustomerId: updatedUser.vectara_customer_id,
        vectaraPersonalApiKey: updatedUser.vectara_personal_api_key,
      });
    }

    return response.data.success;
  };

  return {
    getCurrentUser,
    createUser,
    updateUser,
    currentUser,
    getChildUsersIds,
  };
};
