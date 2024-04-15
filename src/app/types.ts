export type PortalType = "search" | "summary" | "chat";

export type PortalData = {
  name: string;
  vectaraCorpusId: string;
  type: PortalType;
  portalKey: string;
  ownerVectaraCustomerId: string;
  vectaraQueryApiKey: string;
  isRestricted: boolean;
};
