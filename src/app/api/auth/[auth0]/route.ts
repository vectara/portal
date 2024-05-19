import { handleAuth, handleCallback, handleLogin } from "@auth0/nextjs-auth0";
import { redirect } from "next/navigation";
import { NextApiRequest, NextApiResponse } from "next";
import {
  createUser,
  getUserByAuthServiceId,
  updateUserAuthServiceId,
} from "@/app/api/db";
import { NextRequest } from "next/server";
import url from "url";

const afterCallback = async (req: NextRequest, session: any, state: any) => {
  if (session.user) {
    const internalUser = await getUserByAuthServiceId(session.user.sub);

    // If we don't have a corresponding internal user for yet, create one.
    if (!internalUser) {
      await createUser(session.user.email, session.user.sub);
    } else if (!internalUser.auth_service_id) {
      // If the user was pre-created and logging in for the first time, update their auth service id
      updateUserAuthServiceId(internalUser.id, session.user.sub);
    }

    return session;
  } else {
    redirect("/unauthorized");
  }
};

export const GET = handleAuth({
  login: async (req: NextApiRequest, res: NextApiResponse) => {
    const parsedUrl = url.parse(req.url!, true);
    if (parsedUrl.query.returnTo) {
      return await handleLogin(req, res, {
        returnTo: parsedUrl.query.returnTo as string,
      });
    }
    return await handleLogin(req, res);
  },
  callback: handleCallback({
    afterCallback,
  }),
});
