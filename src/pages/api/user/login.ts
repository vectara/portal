import type { NextApiRequest, NextApiResponse } from "next";
import argon2 from "argon2";
import { getUserByEmail, initSession } from "../utils/db";

type ResponseData = {
  user: any;
};

type Error = {
  error: string;
};

// TODO: Do not rely on this POC "fake" auth for a true release.
// Use a battle-tested solution like Auth0, Cognito, etc.
export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData | Error>
) {
  if (req.method !== "POST") {
    return res.status(405).send({ error: "Only POST requests are allowed" });
  }

  const { email, password } = req.body;

  return getUserAndInitSession(email, password).then((user) => {
    return res.status(200).send({ user });
  });
}

const getUserAndInitSession = async (email: string, password: string) => {
  const possibleUser = await getUserByEmail(email);
  const isPasswordMatch = await argon2.verify(possibleUser.password, password);

  if (!isPasswordMatch) return null;

  const user = {
    id: possibleUser.id,
    email: possibleUser.email,
    vectara_customer_id: possibleUser.vectara_customer_id,
    vectara_personal_api_key: possibleUser.vectara_personal_api_key,
    role: possibleUser.role,
    sessionToken: await initSession(possibleUser.id),
    users_ids: possibleUser.users_ids,
  };

  return user;
};
