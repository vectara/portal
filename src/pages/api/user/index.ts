import type { NextApiRequest, NextApiResponse } from "next";
import argon2 from "argon2";
import {
  createUser as createDbUser,
  updateUser as updateDbUser,
} from "../utils/db";
import { getLoggedInUser } from "../utils/auth";

type ResponseData =
  | {
      user: any;
    }
  | { success: boolean };

type Error = {
  error: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData | Error>
) {
  if (["POST", "PATCH"].indexOf(req?.method ?? "") === -1) {
    return res.status(405).send({ error: "Request method not allowed" });
  }

  if (req.method === "POST") {
    const { email, password } = req.body;

    return createUser(email, password).then((user: any) => {
      return res.status(200).send({ user });
    });
  }
}

const createUser = async (email: string, password: string) => {
  const hashedPassword = await argon2.hash(password);

  return await createDbUser(email, hashedPassword);
};
