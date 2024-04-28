import { handleAuth, handleCallback } from "@auth0/nextjs-auth0";
import { redirect } from "next/navigation";
import { NextApiRequest } from "next";
import { createUser } from "@/pages/api/utils/db";

const afterCallback = async (req: NextApiRequest, session: any) => {
  if (session.user) {
    await createUser(session.user.email, session.user.sub);

    return session;
  } else {
    redirect("/unauthorized");
  }
};

export const GET = handleAuth({
  callback: handleCallback({ afterCallback }),
});
