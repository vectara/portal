import { getUserByAuthServiceId, updateUser } from "@/pages/api/utils/db";
import { withApiAuthRequired, getSession } from "@auth0/nextjs-auth0";
import { NextRequest, NextResponse } from "next/server";
import { withLoginVerification } from "../utils";

export const GET = withLoginVerification(
  async (loggedInUser, re: Request, res) => {
    if (loggedInUser) {
      return NextResponse.json(
        {
          user: {
            ...loggedInUser,
            auth_service_id: undefined,
          },
        },
        { status: 200 }
      );
    }

    return NextResponse.json({ user: null }, { status: 200 });
  }
);

export const PATCH = withApiAuthRequired(async function myApiRoute(req, res) {
  const session = await getSession(req as NextRequest, res as NextResponse);

  if (!session?.user) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  const user = await getUserByAuthServiceId(session.user.sub);
  const {
    vectaraCustomerId,
    vectaraPersonalApiKey,
    vectaraOAuth2ClientId,
    vectaraOAuth2ClientSecret,
  } = await req.json();

  try {
    const updated = await updateUser(
      user.id,
      vectaraCustomerId,
      vectaraPersonalApiKey,
      vectaraOAuth2ClientId,
      vectaraOAuth2ClientSecret
    );

    return updated.length === 0
      ? NextResponse.json({ user: null }, { status: 400 })
      : NextResponse.json({ user: updated[0] }, { status: 200 });
  } catch {
    return NextResponse.json({ user: null }, { status: 400 });
  }
});
