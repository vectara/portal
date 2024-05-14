import { handleAuth, handleCallback } from "@auth0/nextjs-auth0";
import { redirect } from "next/navigation";
import { NextApiRequest } from "next";
import {
  createUser,
  getUserByAuthServiceId,
  updateUserAuthServiceId,
} from "@/pages/api/utils/db";

const afterCallback = async (req: NextApiRequest, session: any) => {
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
  callback: handleCallback({ afterCallback }),
});
