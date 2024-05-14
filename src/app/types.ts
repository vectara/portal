export type PortalType = "search" | "summary" | "chat";

export type PortalData = {
  name: string;
  vectaraCorpusId: string;
  type: PortalType;
  portalKey: string;
  vectaraCustomerId: string;
  vectaraApiKey: string;
  isRestricted: boolean;
  description: string | null;
  ownerId: string | null;
};

export type UserGroupMembership = {
  userId: string;
  groupId: string;
  email: string;
  state: UserGroupMembershipState;
};

export type UserGroupMembershipState =
  | "pending"
  | "accepted"
  | "declined"
  | "revoked";
