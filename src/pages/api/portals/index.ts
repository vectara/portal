import axios from "axios";
import type { NextApiRequest, NextApiResponse } from "next";
import { getPortalsForUser } from "../utils/db";

type ResponseData = {
  portals: any;
};

type Error = {
  error: string;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData | Error>
) {
  if (req.method !== "POST") {
    return res.status(405).send({ error: "Only POST requests allowed" });
  }

  if (!req.url) {
    return res.status(400).send({ error: "Error!" });
  }

  const { ownerId } = req.body;

  return getPortalsForUser(ownerId).then((portals: any) => {
    return res.status(200).send({ portals });
  });

  return;
}
