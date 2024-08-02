import { sendApiResponse, withLoginVerification } from "../utils";
import { getPortalsForUser } from "@/app/api/db";

export const GET = withLoginVerification(async (loggedInUser) => {
  const portals = await getPortalsForUser(loggedInUser.id);
  return sendApiResponse({ portals }, 200);
});
