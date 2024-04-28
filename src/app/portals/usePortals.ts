import axios from "axios";
import { PortalData, PortalType } from "../types";
import { useUser } from "../hooks/useUser";
import { useCallback, useEffect, useState } from "react";

export const usePortals = () => {
  const { currentUser } = useUser();
  const [portals, setPortals] = useState<PortalData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const doAsync = async () => {
      setIsLoading(true);
      const portalDatas = await getPortals();
      setIsLoading(false);
      setPortals(portalDatas);
    };

    doAsync();
  }, [currentUser]);

  const getPortals = useCallback(async (): Promise<PortalData[]> => {
    if (!currentUser?.id) return [];
    const config = {
      method: "post",
      maxBodyLength: Infinity,
      url: `/api/portals`,
      data: {
        ownerId: currentUser?.id,
      },
    };

    const response = await axios(config);

    return response.data.portals.map((portal: any) => ({
      ...portal,
      portalKey: portal.key,
    }));
  }, [currentUser]);

  return { portals, isLoading };
};
