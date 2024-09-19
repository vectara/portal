import axios from "axios";
import qs from "qs";
import ShortUniqueId from "short-unique-id";
import { getSession, withApiAuthRequired } from "@auth0/nextjs-auth0";
import { createPortalForUser, getUserByAuthServiceId } from "@/app/api/db";
import { NextRequest, NextResponse } from "next/server";
import { CreatePortalResponse, PortalType, SubTaskResponse } from "./types";

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

  const { name, type, description, isRestricted } = await req.json();

  if (!name) {
    return NextResponse.json(
      {
        error: "'name' parameter is required",
      },
      { status: 400 }
    );
  }

  const response = await createPortal(
    name,
    type,
    description,
    internalUserData.id,
    internalUserData.vectara_customer_id,
    internalUserData.vectara_personal_api_key,
    internalUserData.oauth2_client_id,
    internalUserData.oauth2_client_secret,
    isRestricted
  );

  if (!response.success) {
    return NextResponse.json(
      {
        error: response.error ?? "There was an error creating your portal.",
      },
      { status: 500 }
    );
  }

  return NextResponse.json(
    {
      portal: response.data,
    },
    { status: 200 }
  );
});

const createPortal = async (
  name: string,
  type: string,
  description: string,
  ownerId: number,
  vectaraCustomerId: string,
  vectaraPersonalApiKey: string,
  vectaraOAuth2ClientId: string,
  vectaraOAuth2ClientSecret: string,
  isRestricted: boolean = false
): Promise<CreatePortalResponse> => {
  const genericError = {
    success: false,
    data: null,
    error: "Sorry! We couldn't create your portal.",
  };

  // Step 1. Create the corpus in Vectara.
  let response = await createCorpus(
    name,
    vectaraCustomerId,
    vectaraPersonalApiKey
  );

  if (response.error) {
    return {
      success: false,
      data: null,
      error: response.error,
    };
  }

  if (!response.corpus) {
    return genericError;
  }

  const corpusId = response.corpus.corpusId;
  const corpusKey = response.corpus.corpusKey;

  // Step 2. Create the query API key for the corpus.
  response = await createApiKey(
    name,
    corpusId,
    vectaraCustomerId,
    vectaraOAuth2ClientId,
    vectaraOAuth2ClientSecret
  );

  if (!response.apiKey) {
    return genericError;
  }

  const apiKey = response.apiKey;

  // Step 3. Create the portal using corpus/customer details.

  const portalKey = randomUUID();

  await createPortalForUser(
    name,
    corpusId,
    corpusKey,
    type,
    description,
    portalKey,
    ownerId,
    isRestricted,
    vectaraCustomerId,
    apiKey
  );

  return {
    success: true,
    data: {
      name,
      id: portalKey,
      type: type as PortalType,
    },
    error: null,
  };
};

const createCorpus = async (
  name: string,
  customerId: string,
  apiKey: string
): Promise<SubTaskResponse> => {
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

  const didReachCorpusLimit =
    resp.data?.status?.code === "ADM__CORPUS_LIMIT_REACHED";

  if (didReachCorpusLimit) {
    return {
      error:
        "You may have reached the maximum allowed corpora for your Vectara account.",
    };
  }

  return {
    corpus: resp.data,
  };
};

const createApiKey = async (
  name: string,
  corpusId: string,
  customerId: string,
  oAuth2ClientId: string,
  oAuth2ClientSecret: string
): Promise<SubTaskResponse> => {
  const jwt = await getJwt(customerId, oAuth2ClientId, oAuth2ClientSecret);

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

  return {
    apiKey: response.data.response[0].keyId,
  };
};

const getJwt = async (
  customerId: string,
  oAuth2ClientId: string,
  oAuth2ClientSecret: string
) => {
  const config = {
    method: "post",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    data: qs.stringify({
      grant_type: "client_credentials",
      client_id: oAuth2ClientId,
      client_secret: oAuth2ClientSecret,
    }),
    url: `https://auth.vectara.io/oauth2/token`,
  };

  const {
    data: { access_token: jwt },
  } = await axios(config);

  return jwt;
};
