import {
  getUserGroupMemberships,
  getUserGroup,
  getUsersById,
} from "@/pages/api/utils/db";
import {
  sendApiResponse,
  sendApiUnauthorizedError,
  withLoginVerification,
} from "../../utils";

export const GET = withLoginVerification(async (loggedInUser, req) => {
  const urlParts = req.nextUrl.pathname.split("/");
  const groupId = urlParts[urlParts.length - 1];
  const groupIdInt = parseInt(groupId);

  if (!groupId || isNaN(groupIdInt)) {
    return sendApiResponse({ error: "Invalid group id" }, 400);
  }
  const group = await getUserGroup(groupIdInt);

  if (group.owner_id !== loggedInUser.id) {
    sendApiUnauthorizedError();
  }

  const memberships = await getUserGroupMemberships(parseInt(groupId));

  const membershipUsers = await getUsersById(
    memberships.map((membership: any) => membership.user_id)
  );

  let groupMemberships: Array<any> = [];

  memberships.forEach((membership: any) => {
    const membershipUser = membershipUsers.find(
      (membershipUser: any) => membershipUser.id === membership.user_id
    );
    if (!membershipUser) return;

    groupMemberships.push({
      id: membership.id,
      group_id: membership.user_group_id,
      user_id: membership.user_id,
      email: membershipUser.email,
      state: membership.state,
    });
  });

  return sendApiResponse({ group_memberships: groupMemberships }, 200);
});
