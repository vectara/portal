export type PortalType = "search" | "summary" | "chat";

export type PortalData = {
  name: string;
  vectaraCorpusId: string;
  type: PortalType;
  portalKey: string;
  vectaraCustomerId: string;
  vectaraApiKey: string;
  isRestricted: boolean;
};
