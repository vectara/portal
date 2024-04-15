import axios from "axios";
import { PortalType } from "../../types";
import { currentUserState } from "../../state/user";
import { useRecoilState } from "recoil";

export const useCreatePortal = () => {
  const [currentUser, setCurrentUser] = useRecoilState(currentUserState);

  const createPortal = async (
    name: string,
    type: PortalType,
    isRestricted: boolean
  ) => {
    if (!currentUser?.sessionToken) return;

    const config = {
      method: "post",
      maxBodyLength: Infinity,
      url: "/api/create-portal",
      data: {
        name,
        type,
        isRestricted,
      },
      headers: {
        Authorization: currentUser.sessionToken,
      },
    };

    const response = await axios(config);

    return {
      name: response.data.portal.name,
      key: response.data.portal.id,
      type: response.data.portal.type,
    };
  };

  return { createPortal };
};

const createApiKey = async (jwt: string, corpusId: string) => {
  const data = JSON.stringify({
    apiKeyData: [
      {
        description: "string",
        apiKeyType: "API_KEY_TYPE__UNDEFINED",
        corpusId: [corpusId],
      },
    ],
  });

  const config = {
    method: "post",
    maxBodyLength: Infinity,
    url: "https://api.vectara.io/v1/create-api-key",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${jwt}`,
      "customer-id": "3874164736",
    },
    data: data,
  };

  const response = await axios(config);

  console.log("### api key resp: ", response.data);
};

// const authenticate = async (): Promise<string | null> => {
//   const response = await axios.get("/api/auth");
//   console.log("### jwt", response.data);
//   return response.data.jwt ?? null;
// };
