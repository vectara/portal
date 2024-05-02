import axios from "axios";
import { useRecoilState } from "recoil";
import { currentUserState } from "../state/currentUser";

export const useUser = () => {
  const [currentUser, setCurrentUser] = useRecoilState(currentUserState);

  const loadCurrentUser = async () => {
    const config = {
      method: "get",
      url: `/api/me`,
    };

    try {
      const response = await axios(config);
      const user = response.data.user;

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
    vectaraCustomerId?: string,
    vectaraPersonalApiKey?: string,
    addEmails?: Array<string>
  ) => {
    const response = await axios.patch("/api/me", {
      vectaraCustomerId,
      vectaraPersonalApiKey,
      addEmails,
    });

    if (response.data.user && currentUser) {
      setCurrentUser({
        ...currentUser,
        vectaraCustomerId: response.data.user.vectara_customer_id,
        vectaraPersonalApiKey: response.data.user.vectara_personal_api_key,
      });
    }

    return response.data.success;
  };

  return {
    loadCurrentUser,
    createUser,
    updateUser,
    currentUser,
    getChildUsersIds,
  };
};
