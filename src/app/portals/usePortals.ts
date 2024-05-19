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
    if (!currentUser?.id) return [];
    const config = {
      method: "get",
      maxBodyLength: Infinity,
      url: `/api/portals`,
    };

    const response = await axios(config);

    return response.data.portals.map((portal: any) => ({
      name: portal.name,
      vectaraCorpusId: portal.vectara_corpus_id,
      type: portal.type,
      portalKey: portal.key,
      vectaraCustomerId: portal.vectara_customer_id,
      vectaraApiKey: portal.vectara_personal_api_key,
      isRestricted: portal.is_restricted,
      description: portal.description,
      ownerId: portal.owner_id,
    }));
  }, [currentUser]);

  return { portals, isLoading };
};
