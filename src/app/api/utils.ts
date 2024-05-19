import { getUserByAuthServiceId } from "@/app/api/db";
import {
  AppRouteHandlerFn,
  getSession,
  withApiAuthRequired,
} from "@auth0/nextjs-auth0";
import { NextApiRequest, NextApiResponse } from "next";
import { NextRequest, NextResponse } from "next/server";

export type LoggedInRouteHandler = (
  loggedInUser: any,
  req: NextRequest,
  res: NextResponse
) => void;

export const sendApiResponse = (
  message: Record<string, any>,
  statusCode: number
) => {
  return NextResponse.json(message, { status: statusCode });
};

export const sendApiUnauthorizedError = () =>
  sendApiResponse({ error: "Unauthorized" }, 401);

export const sendApiUserNotFoundError = () =>
  sendApiResponse({ error: "User not found" }, 500);

export const withLoginVerification = (handler: LoggedInRouteHandler) => {
  const apiRoute = async (req: Request, res: any) => {
    const session = await getSession(req as any, res);

    if (!session) {
      return sendApiUnauthorizedError();
    }

    const internalUserData = await getUserByAuthServiceId(session.user.sub);

    if (!internalUserData) {
      return sendApiUserNotFoundError();
    }

    return handler(internalUserData, req as any, res);
  };

  return withApiAuthRequired(apiRoute as any);
};
