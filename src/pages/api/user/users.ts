import type { NextApiRequest, NextApiResponse } from "next";
import {
  endSession,
  getUserByEmail,
  getUserIdsForParentUserId,
  getUsersFromIds,
  initSession,
} from "../utils/db";
import { getLoggedInUser } from "../utils/auth";

type ResponseData = {
  users: Array<any>;
};

type Error = {
  error: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData | Error>
) {
  if (req.method !== "GET") {
    return res.status(405).send({ error: "Only GET requests are allowed" });
  }

  const loggedInUser = await getLoggedInUser(req);

  if (!loggedInUser) {
    return res.status(200).send({ users: [] });
  }

  const usersIds = await getUserIdsForParentUserId(loggedInUser.id);
  const users = await getUsersFromIds(usersIds.users_ids);

  return res.status(200).send({ users });
}
