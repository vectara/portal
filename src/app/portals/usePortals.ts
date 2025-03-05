import axios from "axios";
import { PortalData } from "../types";
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
    if (!currentUser?.id) {
      console.log("No current user ID available");
      return [];
    }

    const config = {
      method: "get",
      maxBodyLength: Infinity,
      url: `/api/portals`,
    };

    const response = await axios(config);
    console.log("API response:", response.data);
    
    return response.data.portals.map((portal: any) => {
      const portalData = {
        name: portal.name,
        vectaraCorpusId: portal.vectara_corpus_id,
        vectaraCorpusKey: portal.vectara_corpus_key,
        type: portal.type,
        portalKey: portal.key,
        vectaraApiKey: currentUser.vectaraPersonalApiKey,
        vectaraCustomerId: currentUser.vectaraCustomerId,
        isRestricted: portal.is_restricted,
        description: portal.description,
        ownerId: portal.owner_id,
      };
      return portalData;
    });
  }, [currentUser]);

  return { portals, isLoading };
};
