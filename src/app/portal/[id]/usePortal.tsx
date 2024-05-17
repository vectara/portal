import axios, { AxiosError } from "axios";
import { PortalData, PortalType } from "../../types";

type PortalDataWithPrivilege = {
  isAuthorized: boolean;
  data: PortalData | null;
};

export const usePortal = () => {
  const getPortal = async (key: string): Promise<PortalDataWithPrivilege> => {
    const config = {
      method: "get",
      maxBodyLength: Infinity,
      url: `/api/portal/${key}`,
    };

    try {
      const response = await axios(config);
      const { portal: portalData } = response.data;

      if (!portalData) {
        return {
          isAuthorized: true,
          data: null,
        };
      }

      return {
        isAuthorized: response.status === 200,
        data: {
          name: portalData.name,
          vectaraCorpusId: portalData.vectara_corpus_id,
          type: portalData.type,
          portalKey: portalData.key,
          vectaraCustomerId: portalData.vectara_customer_id,
          vectaraApiKey: portalData.vectara_api_key,
          isRestricted: portalData.is_restricted,
          description: portalData.description,
          ownerId: portalData.owner_id,
        },
      };
    } catch (e: any) {
      return {
        // We only consider explicit 401s as being unauthorized.
        // Anything else is an error that doesn't reflect any authorization
        isAuthorized: e.response.status !== 401,
        data: null,
      };
    }
  };

  const updatePortal = async (
    key: string,
    name: string,
    isRestricted: boolean,
    type: PortalType,
    description: string
  ) => {
    const config = {
      maxBodyLength: Infinity,
    };

    return axios.patch(
      `/api/portal/${key}`,
      { key, name, isRestricted, type, description },
      config
    );
  };

  const deletePortal = async (key: string) => {
    return axios.delete(`/api/portal/${key}`);
  };

  return { getPortal, updatePortal, deletePortal };
};
