import axios from "axios";
import { PortalData, PortalType } from "../types";

export const usePortals = () => {
  const getPortals = async (
    vectaraCustomerId: string
  ): Promise<PortalData[]> => {
    const config = {
      method: "post",
      maxBodyLength: Infinity,
      url: `/api/portals`,
      data: {
        vectaraCustomerId,
      },
    };

    const response = await axios(config);

    return response.data.portals.map((portal: any) => ({
      ...portal,
      portalKey: portal.key,
    }));
  };

  return { getPortals };
};
