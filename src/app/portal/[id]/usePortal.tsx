import axios from "axios";
import { PortalType, PortalData } from "../../types";

export const usePortal = () => {
  const getPortal = async (key: string): Promise<PortalData> => {
    const config = {
      method: "get",
      maxBodyLength: Infinity,
      url: `/api/portal/${key}`,
    };

    const response = await axios(config);
    const { portal: portalData } = response.data;

    return {
      name: portalData.name,
      vectaraCorpusId: portalData.vectara_corpus_id,
      type: portalData.type,
      portalKey: portalData.key,
      vectaraCustomerId: portalData.vectara_customer_id,
      vectaraApiKey: portalData.vectara_api_key,
      isRestricted: portalData.is_restricted,
    };
  };

  const updatePortal = async (
    key: string,
    name: string,
    isRestricted: boolean
  ) => {
    const config = {
      maxBodyLength: Infinity,
    };

    axios.patch(`/api/portal/${key}`, { key, name, isRestricted }, config);
  };

  return { getPortal, updatePortal };
};
