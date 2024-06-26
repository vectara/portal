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
          vectaraOAuth2ClientId: user.oauth2_client_id,
          vectaraOAuth2ClientSecret: user.oauth2_client_secret,
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
    vectaraOAuth2ClientId?: string,
    vectaraOAuth2ClientSecret?: string,
    addEmails?: Array<string>
  ) => {
    const response = await axios.patch("/api/me", {
      vectaraCustomerId,
      vectaraPersonalApiKey,
      vectaraOAuth2ClientId,
      vectaraOAuth2ClientSecret,
      addEmails,
    });

    if (response.data.user && currentUser) {
      setCurrentUser({
        ...currentUser,
        vectaraCustomerId: response.data.user.vectara_customer_id,
        vectaraPersonalApiKey: response.data.user.vectara_personal_api_key,
        vectaraOAuth2ClientId: response.data.user.oauth2_client_id,
        vectaraOAuth2ClientSecret: response.data.user.oauth2_client_secret,
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
