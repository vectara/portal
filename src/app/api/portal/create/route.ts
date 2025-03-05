import axios from "axios";
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

  const corpusId = response.corpus.id;
  const corpusKey = response.corpus.key;


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
    vectaraPersonalApiKey
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
  apiKey: string
): Promise<SubTaskResponse> => {

  const corpusName = `${name.replace(/ +/g, "-").toLowerCase()}-portal-corpus`;
  const corpusKey = corpusName.length > 50 ? corpusName.slice(-50) : corpusName;

  const data = JSON.stringify({
    key: corpusKey,
    name: corpusName,
  
  });

  const config = {
    method: "post",
    maxBodyLength: Infinity,
    url: "https://api.vectara.io/v2/corpora",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "x-api-key": apiKey
    },
    data: data,
  };

  const resp = await axios(config);

  if (resp.status !== 201) {
    let errorMessage = "Unknown error occurred.";

    if (resp.data?.messages && resp.data.messages.length > 0) {
      errorMessage = resp.data.messages.join(", ");
    } 

    else if (resp.data?.field_errors) {
      // Convert the field_errors object into a readable string
      const fieldErrorStrings = Object.entries(resp.data.field_errors)
        .map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(", ") : errors}`)
        .join("; ");

      errorMessage = `Field errors: ${fieldErrorStrings}`;
    }
    console.log(errorMessage);
    return {
      error: `Unable to create corpus. Reason: ${errorMessage}`,
    };
  }


  return {
    corpus: resp.data,
  };
};
