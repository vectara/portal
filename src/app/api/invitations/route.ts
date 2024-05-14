import { withLoginVerification } from "../utils";
import { NextResponse } from "next/server";
import {
  acceptUserGroupMembership,
  getPendingUserGroupMembershipsForUser,
} from "@/pages/api/utils/db";

export const GET = withLoginVerification(async (loggedInUser, req, res) => {
  const invitations = await getPendingUserGroupMembershipsForUser(
    loggedInUser.id
  );

  return NextResponse.json({ invitations }, { status: 200 });
});

export const POST = withLoginVerification(async (loggedInUser, req, res) => {
  const { invitationId } = await req.json();
  const result = await acceptUserGroupMembership(loggedInUser.id, invitationId);

  return NextResponse.json({ result }, { status: 200 });
});
