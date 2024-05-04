import axios from "axios";
import qs from "qs";
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
    internalUserData.vectara_customer_id,
    internalUserData.vectara_personal_api_key,
    isRestricted
  );

  if (!portal) {
    return NextResponse.json(
      {
        error: "Error creating portal.",
      },
      { status: 500 }
    );
  }

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
  vectaraCustomerId: string,
  vectaraPersonalApiKey: string,
  isRestricted: boolean = false
) => {
  // Step 1. Create the corpus in Vectara.
  const corpus = await createCorpus(
    name,
    vectaraCustomerId,
    vectaraPersonalApiKey
  );

  if (!corpus) {
    return null;
  }

  const corpusId = corpus.corpusId;

  // Step 2. Create the query API key for the corpus.
  const apiKey = await createApiKey(
    name,
    corpusId,
    vectaraCustomerId,
    vectaraPersonalApiKey
  );

  if (!apiKey) {
    return null;
  }

  // Step 3. Create the portal using corpus/customer details.

  const portalKey = randomUUID();

  await createPortalForUser(
    name,
    corpusId,
    type,
    portalKey,
    ownerId,
    isRestricted,
    vectaraCustomerId,
    apiKey
  );

  return {
    name,
    id: portalKey,
    type,
  };
};

const createCorpus = async (
  name: string,
  customerId: string,
  apiKey: string
) => {
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
      "customer-id": customerId,
    },
    data: data,
  };

  const resp = await axios(config);
  return resp.data;
};

const createApiKey = async (
  name: string,
  corpusId: string,
  customerId: string,
  apiKey: string
) => {
  const jwt = await getJwt();

  const data = JSON.stringify({
    apiKeyData: [
      {
        description: `${name.replace(/ +/g, "-").toLowerCase()}-query-api-key`,
        apiKeyType: "API_KEY_TYPE__SERVING",
        corpusId: [corpusId],
      },
    ],
  });

  const config = {
    method: "post",
    maxBodyLength: Infinity,
    url: "https://api.vectara.io/v1/create-api-key",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${jwt}`,
      "customer-id": customerId,
    },
    data: data,
  };

  const response = await axios(config);

  return response.data.response[0].keyId;
};

const OAUTH2_URL =
  "https://vectara-prod-3614030405.auth.us-west-2.amazoncognito.com/oauth2/token";
const OAUTH2_CLIENT_ID = "10bimhllnk3h8pg1094ihc9fv6";
const OAUTH2_CLIENT_SECRET =
  "13uu6ktdemrj6a0uges477kasa99v0n7bec2l3t5o2s1jb9ob074";

const getJwt = async () => {
  const config = {
    method: "post",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    data: qs.stringify({
      grant_type: "client_credentials",
      client_id: OAUTH2_CLIENT_ID,
      client_secret: OAUTH2_CLIENT_SECRET,
    }),
    url: OAUTH2_URL,
  };

  const {
    data: { access_token: jwt },
  } = await axios(config);

  return jwt;
};
