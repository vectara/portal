import { NextApiRequest } from "next";
import { getLoggedInUserForToken } from "./db";

export const getLoggedInUser = async (req: NextApiRequest) => {
  const { authorization } = req.headers;

  const loggedInUser = authorization
    ? await getLoggedInUserForToken(authorization)
    : null;

  return loggedInUser;
};
