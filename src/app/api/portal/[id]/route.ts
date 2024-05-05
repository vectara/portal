import {
  getPortalByKey,
  getUserByAuthServiceId,
  updatePortal,
} from "@/pages/api/utils/db";
import { getSession, withApiAuthRequired } from "@auth0/nextjs-auth0";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  const urlParts = req.url.split("/");

  const portalKey = urlParts[urlParts.length - 1];
  const portal = await getPortalByKey(portalKey);

  return NextResponse.json(
    {
      portal,
    },
    { status: 200 }
  );
};

export const PATCH = withApiAuthRequired(async function myApiRoute(req, res) {
  const session = await getSession(req as NextRequest, res as NextResponse);

  if (!session) {
    return NextResponse.json(
      {
        error: "There was an error retrieving user credentials.",
      },
      { status: 401 }
    );
  }

  const internalUserData = await getUserByAuthServiceId(session.user.sub);

  if (!internalUserData) {
    return NextResponse.json(
      {
        error: "There was an error creating your portal.",
      },
      { status: 500 }
    );
  }

  const { key, name, isRestricted } = await req.json();

  if (!name && !key && !isRestricted) {
    return NextResponse.json(
      {
        error: "One of (key, name, isRestricted) is required",
      },
      { status: 400 }
    );
  }

  const portal = await updatePortal(key, name, isRestricted);

  console.log("### UPDATED PORTAL: ", portal);

  return NextResponse.json(
    {
      portal,
    },
    { status: 200 }
  );
});
