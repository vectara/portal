import type { NextApiRequest, NextApiResponse } from "next";
import { getPortalByKey, getUserById, updatePortal } from "../utils/db";

type ResponseData = {
  user: any;
};

type Error = {
  error: string;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData | Error>
) {
  if (!req.url) {
    return res.status(500).send({ error: "There was an error" });
  }

  if (req.method === "GET") {
    const urlParts = req.url.split("/");

    const userId = urlParts[urlParts.length - 1];
    return getUserById(parseInt(userId)).then((user: any) => {
      return res.status(200).send({ user });
    });
  }

  if (req.method === "POST") {
    console.log(req.body);
  }

  return res.status(200);
}
