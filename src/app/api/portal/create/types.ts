export type PortalType = "search" | "summary" | "chat";

export type CreatePortalResponse = {
  success: boolean;
  data: {
    name: string;
    id: string;
    type: PortalType;
  } | null;
  error: string | null;
};

export type SubTaskResponse = {
  error?: string;
  corpus?: any;
  apiKey?: string;
};
