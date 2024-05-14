import { getUserGroupsForUser } from "@/pages/api/utils/db";
import { sendApiResponse, withLoginVerification } from "../../utils";

// TODO: We don't need the dynamic param. Move directly /groups directory
export const GET = withLoginVerification(async (loggedInUser) => {
  const groups = await getUserGroupsForUser(loggedInUser.id);

  return sendApiResponse({ groups }, 200);
});
