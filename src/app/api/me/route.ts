import { getUserByAuthServiceId, updateUser } from "@/app/api/db";
import { withApiAuthRequired, getSession } from "@auth0/nextjs-auth0";
import { NextRequest, NextResponse } from "next/server";
import { withLoginVerification } from "../utils";

export const GET = withLoginVerification(async (loggedInUser) => {
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
});

export const PATCH = withApiAuthRequired(async function myApiRoute(req, res) {
  const session = await getSession(req as NextRequest, res as NextResponse);

  if (!session?.user) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  const user = await getUserByAuthServiceId(session.user.sub);
  const {
    vectaraPersonalApiKey,
    vectaraCustomerId,
  } = await req.json();

  try {
    const updated = await updateUser(
      user.id,
      vectaraPersonalApiKey,
      vectaraCustomerId,
    );

    return updated.length === 0
      ? NextResponse.json({ user: null }, { status: 400 })
      : NextResponse.json({ user: updated[0] }, { status: 200 });
  } catch {
    return NextResponse.json({ user: null }, { status: 400 });
  }
});
