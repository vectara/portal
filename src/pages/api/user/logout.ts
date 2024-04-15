import type { NextApiRequest, NextApiResponse } from "next";
import argon2 from "argon2";
import { endSession, getUserByEmail, initSession } from "../utils/db";

type ResponseData = {
  success: boolean;
};

type Error = {
  error: string;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData | Error>
) {
  if (req.method !== "POST") {
    return res.status(405).send({ error: "Only POST requests are allowed" });
  }

  const sessionToken = req.headers.authorization;

  if (!sessionToken) {
    return res.status(400).send({ success: false });
  }

  endSession(sessionToken);

  return res.status(200).send({ success: true });
}
