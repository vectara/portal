import { getUserByAuthServiceId } from "@/pages/api/utils/db";
import { withApiAuthRequired, getSession } from "@auth0/nextjs-auth0";
import { NextApiRequest, NextApiResponse } from "next";
import { NextResponse } from "next/server";

export const GET = withApiAuthRequired(async function myApiRoute(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getSession(req, res);

  if (session) {
    const internalUserData = await getUserByAuthServiceId(session.user.sub);

    return NextResponse.json(
      {
        user: {
          ...internalUserData,
          auth_service_id: undefined,
        },
      },
      { status: 200 }
    );
  }

  return NextResponse.json({ user: null }, { status: 200 });
});
