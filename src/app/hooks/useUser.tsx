import axios from "axios";
import { currentUserState } from "../state/user";
import { useRecoilState } from "recoil";

export const useUser = () => {
  const [currentUser, setCurrentUser] = useRecoilState(currentUserState);

  const loginUser = async (email: string, password: string) => {
    const config = {
      method: "post",
      maxBodyLength: Infinity,
      url: "/api/user/login",
      data: {
        email,
        password,
      },
    };

    const response = await axios(config);
    const loggedInUser = response.data.user
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

    if (loggedInUser) {
      setCurrentUser(loggedInUser);
    }

    return loggedInUser;
  };

  const logoutUser = async (sessionToken: string) => {
    setCurrentUser(null);

    const config = {
      method: "post",
      maxBodyLength: Infinity,
      url: "/api/user/logout",
      headers: {
        Authorization: sessionToken,
      },
    };

    await axios(config);

    return true;
  };

  const getUser = async (id: number) => {
    const config = {
      method: "get",
      maxBodyLength: Infinity,
      url: `/api/user/${id}`,
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
      headers: {
        Authorization: currentUser?.sessionToken,
      },
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
    const config = {
      maxBodyLength: Infinity,
      headers: {
        Authorization: currentUser?.sessionToken,
      },
    };

    const response = await axios.patch(
      "/api/user",
      { email, vectaraCustomerId, vectaraPersonalApiKey, addEmails },
      config
    );

    if (response.data.success && currentUser) {
      const updatedUser = await getUser(currentUser.id ?? 0);
      setCurrentUser({
        ...updatedUser.user,
        sessionToken: currentUser.sessionToken,
        vectaraCustomerId: updatedUser.vectara_customer_id,
        vectaraPersonalApiKey: updatedUser.vectara_personal_api_key,
      });
    }

    return response.data.success;
  };

  return {
    getUser,
    createUser,
    updateUser,
    loginUser,
    logoutUser,
    currentUser,
    getChildUsersIds,
  };
};
