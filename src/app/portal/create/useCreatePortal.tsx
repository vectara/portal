import axios from "axios";
import { PortalType } from "../../types";

export const useCreatePortal = () => {
  const createPortal = async (
    name: string,
    type: PortalType,
    isRestricted: boolean
  ) => {
    const config = {
      method: "post",
      maxBodyLength: Infinity,
      url: "/api/portal/create",
      data: {
        name,
        type,
        isRestricted,
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
