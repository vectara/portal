import axios from "axios";
import { PortalType } from "../../types";
import { ACTION_CREATE_PORTAL } from "@/app/analytics";
import * as amplitude from '@amplitude/analytics-browser';

export const useCreatePortal = () => {

  const createPortal = async (
    name: string,
    description: string,
    type: PortalType,
    isRestricted: boolean,
    vectaraCustomerId: string,
    vectaraApiKey: string
  ) => {
    const config = {
      method: "post",
      maxBodyLength: Infinity,
      url: "/api/portal/create",
      data: {
        name,
        description,
        type,
        isRestricted,
        vectaraCustomerId,
        vectaraApiKey,
      },
    };

    try {
      const response = await axios(config);

      amplitude.track(ACTION_CREATE_PORTAL, { type, isRestricted });

      return {
        success: true,
        data: {
          name: response.data.portal.name,
          key: response.data.portal.id,
          type: response.data.portal.type,
        },
      };
    } catch (e: any) {
      return {
        success: false,
        error: e.response?.data?.error ?? "Error",
      };
    }
  };

  return { createPortal };
};
