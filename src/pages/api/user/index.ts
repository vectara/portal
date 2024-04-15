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

  if (req.method === "PATCH") {
    const { email, vectaraCustomerId, vectaraPersonalApiKey, addEmails } =
      req.body;

    return await updateUser(
      req,
      email,
      vectaraCustomerId,
      vectaraPersonalApiKey,
      addEmails
    ).then((result) => {
      if (result === false) {
        return res.status(400).send({ success: false });
      }
      return res.status(200).send({ success: true });
    });
  }
}

const createUser = async (email: string, password: string) => {
  const hashedPassword = await argon2.hash(password);

  return await createDbUser(email, hashedPassword);
};

const updateUser = async (
  req: NextApiRequest,
  email: string,
  vectaraCustomerId: string,
  vectaraPersonalApiKey: string,
  addEmails: Array<string> = []
) => {
  const newUserIds: Array<number> = [];

  const loggedInUser = await getLoggedInUser(req);

  if (!loggedInUser) {
    return false;
  }

  if (addEmails.length > 0) {
    for (let i = 0; i < addEmails.length; i++) {
      const newUser = await createDbUser(
        addEmails[i],
        await argon2.hash("ilovevectara"),
        "user"
      );
      newUserIds.push(newUser.id);
    }
  }

  const updatedUserIds = [
    ...(loggedInUser.users_ids ?? []),
    ...(newUserIds ?? []),
  ];

  return await updateDbUser(
    email,
    vectaraCustomerId,
    vectaraPersonalApiKey,
    updatedUserIds
  );
};
