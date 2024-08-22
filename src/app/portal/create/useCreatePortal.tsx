import axios from "axios";
import { PortalType } from "../../types";
import { ACTION_CREATE_PORTAL } from "@/app/analytics";
import { useAmplitude } from "amplitude-react";

export const useCreatePortal = () => {
  const { logEvent } = useAmplitude();

  const createPortal = async (
    name: string,
    description: string,
    type: PortalType,
    isRestricted: boolean
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
      },
    };

    try {
      const response = await axios(config);

      logEvent(ACTION_CREATE_PORTAL, { type, isRestricted });

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
