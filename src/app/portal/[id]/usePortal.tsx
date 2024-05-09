import axios from "axios";
import { PortalData, PortalType } from "../../types";

export const usePortal = () => {
  const getPortal = async (key: string): Promise<PortalData | null> => {
    const config = {
      method: "get",
      maxBodyLength: Infinity,
      url: `/api/portal/${key}`,
    };

    const response = await axios(config);
    const { portal: portalData } = response.data;

    if (!portalData) {
      return null;
    }

    return {
      name: portalData.name,
      vectaraCorpusId: portalData.vectara_corpus_id,
      type: portalData.type,
      portalKey: portalData.key,
      vectaraCustomerId: portalData.vectara_customer_id,
      vectaraApiKey: portalData.vectara_api_key,
      isRestricted: portalData.is_restricted,
      description: portalData.description,
    };
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
