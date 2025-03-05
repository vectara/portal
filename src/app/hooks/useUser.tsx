import axios from "axios";
import { useRecoilState } from "recoil";
import { currentUserState } from "../state/currentUser";
import * as amplitude from '@amplitude/analytics-browser';
import { ACTION_START_SESSION } from "../analytics";

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
        amplitude.track(ACTION_START_SESSION, { id: user.id, email: user.email });
        amplitude.setUserId(user.id);
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
        vectaraPersonalApiKey: response.data.user.vectara_personal_api_key
      });
    }

    return response.data.success;
  };

  return {
    loadCurrentUser,
    updateUser,
    currentUser,
  };
};
