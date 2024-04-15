import type { NextApiRequest, NextApiResponse } from "next";
import { getPortalByKey, updatePortal } from "../utils/db";

type ResponseData = {
  portal: any;
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

    const portalKey = urlParts[urlParts.length - 1];
    return getPortalByKey(portalKey).then((portal: any) => {
      return res.status(200).send({ portal });
    });
  }

  if (req.method === "PATCH") {
    return handlePatch(req, res).then(() => {
      return res.status(200).send({ portal: null });
    });
  }

  return res.status(200);
}

const handlePatch = async (
  req: NextApiRequest,
  res: NextApiResponse<ResponseData | Error>
) => {
  const { key, name, isRestricted } = req.body;
  return updatePortal(key, name, isRestricted);
};
