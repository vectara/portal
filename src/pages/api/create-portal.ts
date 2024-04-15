import axios from "axios";
import type { NextApiRequest, NextApiResponse } from "next";
import ShortUniqueId from "short-unique-id";
import { createPortalForUser, getLoggedInUserForToken } from "./utils/db";
import { getLoggedInUser } from "./utils/auth";

type ResponseData = {
  portal: any;
};

type Error = {
  error: string;
};

const { randomUUID } = new ShortUniqueId({ length: 10 });

// TODO: Move to portals POST handler
// TODO: Get logged in user from token
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData | Error>
) {
  if (req.method !== "POST") {
    return res.status(405).send({ error: "Only POST requests allowed" });
  }

  const loggedInUser = await getLoggedInUser(req);

  if (!loggedInUser) {
    return res.status(400).send({ portal: null });
  }

  const { name, type, isRestricted } = req.body;

  if (!name) {
    return res.status(400).send({ error: "name parameter is required" });
  }

  const initiateFlow = async () => {
    // Step 1. Create the corpus in Vectara.
    const corpus = await createCorpus(name, process.env.TEST_API_KEY!);

    // Step 3. Create the portal using corpus/customer details.
    const vectaraCustomerId = process.env.CUSTOMER_ID!;
    const corpusId = corpus.corpusId;
    const vectaraApiKey = process.env.TEST_API_KEY!;
    const portalKey = randomUUID();

    await createPortalForUser(
      name,
      corpusId,
      type ?? "search",
      portalKey,
      vectaraCustomerId,
      vectaraApiKey,
      isRestricted
    );

    return {
      name,
      id: portalKey,
      type,
    };
  };

  return initiateFlow().then((portal) => {
    return res.status(200).send({ portal });
  });
}

const createCorpus = async (name: string, apiKey: string) => {
  const data = JSON.stringify({
    corpus: {
      id: 0,
      name: `${name.replace(/ +/g, "-").toLowerCase()}-portal-corpus`,
      enabled: true,
      encrypted: true,
      metadataMaxBytes: 0,
    },
  });

  const config = {
    method: "post",
    maxBodyLength: Infinity,
    url: "https://api.vectara.io/v1/create-corpus",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "x-api-key": apiKey,
      "customer-id": process.env.TEST_CUSTOMER_ID,
    },
    data: data,
  };

  const resp = await axios(config);
  return resp.data;
};
