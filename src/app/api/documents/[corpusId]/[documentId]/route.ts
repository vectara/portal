import { getUserByAuthServiceId } from "@/pages/api/utils/db";
import { getSession, withApiAuthRequired } from "@auth0/nextjs-auth0";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

export const DELETE = withApiAuthRequired(async function myApiRoute(req, res) {
  const urlParts = req.nextUrl.pathname.split("/");
  const corpusId = urlParts[urlParts.length - 2];
  const documentId = urlParts[urlParts.length - 1];

  const session = await getSession(req as NextRequest, res as NextResponse);

  if (!session) {
    return NextResponse.json(
      {
        error: "There was an error deleting the corpus document.",
      },
      { status: 401 }
    );
  }

  const internalUserData = await getUserByAuthServiceId(session.user.sub);

  if (!internalUserData) {
    return NextResponse.json(
      {
        error: "No authorized user found",
      },
      { status: 401 }
    );
  }

  const { vectara_customer_id: customerId, vectara_personal_api_key: apiKey } =
    internalUserData;

  if (!apiKey || !customerId) {
    return NextResponse.json(
      {
        error: "Insufficient credentials to get documents.",
      },
      { status: 400 }
    );
  }

  const success = await deleteDocumentForCorpus(
    customerId,
    corpusId,
    documentId,
    apiKey
  );

  return NextResponse.json(
    {
      success,
    },
    { status: success ? 200 : 400 }
  );
});

const deleteDocumentForCorpus = async (
  customerId: string,
  corpusId: string,
  documentId: string,
  apiKey: string
) => {
  const data = JSON.stringify({
    customerId,
    corpusId,
    documentId,
  });

  const config = {
    method: "post",
    maxBodyLength: Infinity,
    url: "https://api.vectara.io/v1/delete-doc",
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
