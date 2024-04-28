import axios from "axios";
import ShortUniqueId from "short-unique-id";
import { getSession, withApiAuthRequired } from "@auth0/nextjs-auth0";
import {
  createPortalForUser,
  getUserByAuthServiceId,
} from "@/pages/api/utils/db";
import { NextRequest, NextResponse } from "next/server";

const { randomUUID } = new ShortUniqueId({ length: 10 });

export const POST = withApiAuthRequired(async function myApiRoute(req, res) {
  const session = await getSession(req as NextRequest, res as NextResponse);

  if (!session) {
    return NextResponse.json(
      {
        error: "There was an error retrieving user credentials.",
      },
      { status: 401 }
    );
  }

  const internalUserData = await getUserByAuthServiceId(session.user.sub);

  if (!internalUserData) {
    return NextResponse.json(
      {
        error: "There was an error creating your portal.",
      },
      { status: 500 }
    );
  }

  const { name, type, isRestricted } = await req.json();

  if (!name) {
    return NextResponse.json(
      {
        error: "'name' parameter is required",
      },
      { status: 400 }
    );
  }

  const portal = await createPortal(
    name,
    type,
    internalUserData.id,
    internalUserData.vectara_personal_api_key,
    isRestricted
  );

  return NextResponse.json(
    {
      portal,
    },
    { status: 200 }
  );
});

const createPortal = async (
  name: string,
  type: string = "search",
  ownerId: number,
  vectaraPersonalApiKey: string,
  isRestricted: boolean = false
) => {
  // Step 1. Create the corpus in Vectara.
  const corpus = await createCorpus(name, vectaraPersonalApiKey);

  // Step 3. Create the portal using corpus/customer details.
  const corpusId = corpus.corpusId;
  const portalKey = randomUUID();

  await createPortalForUser(
    name,
    corpusId,
    type,
    portalKey,
    ownerId,
    isRestricted
  );

  return {
    name,
    id: portalKey,
    type,
  };
};

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
