import { withLoginVerification } from "../../utils";
import { NextResponse } from "next/server";
import {
  acceptUserGroupMembership,
  rejectUserGroupMembership,
  resendUserGroupMembership,
  revokeUserGroupMembership,
} from "@/pages/api/utils/db";

export const POST = withLoginVerification(async (loggedInUser, req, res) => {
  const urlParts = req.nextUrl.pathname.split("/");
  const action = urlParts[urlParts.length - 1];
  const { invitationId } = await req.json();

  let result;

  try {
    switch (action) {
      case "accept":
        result = await acceptUserGroupMembership(loggedInUser.id, invitationId);
        break;
      case "reject":
        result = await rejectUserGroupMembership(loggedInUser.id, invitationId);
        break;
      case "revoke":
        result = await revokeUserGroupMembership(loggedInUser.id, invitationId);
        break;
      case "resend":
        result = await resendUserGroupMembership(loggedInUser.id, invitationId);
        break;
      default:
        break;
    }
    return NextResponse.json({ result }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Could not modify invitation" },
      { status: 500 }
    );
  }
});
