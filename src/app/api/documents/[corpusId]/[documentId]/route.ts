import { getUserByAuthServiceId } from "@/app/api/db";
import { getSession, withApiAuthRequired } from "@auth0/nextjs-auth0";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

export const DELETE = withApiAuthRequired(async function myApiRoute(req, res) {
  const urlParts = req.nextUrl.pathname.split("/");
  const corpusKey = urlParts[urlParts.length - 2];
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

  const { vectara_personal_api_key: apiKey } =
    internalUserData;

  if (!apiKey) {
    return NextResponse.json(
      {
        error: "Insufficient credentials to get documents.",
      },
      { status: 400 }
    );
  }

  const success = await deleteDocumentForCorpus(
    corpusKey,
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
  corpusKey: string,
  documentId: string,
  apiKey: string
) => {

  const config = {
    method: "delete",
    maxBodyLength: Infinity,
    url: `https://api.vectara.io/v2/corpora/${corpusKey}/documents/${documentId}`,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "x-api-key": apiKey,
    }
  };

  const resp = await axios(config);
  return resp.data;
};
