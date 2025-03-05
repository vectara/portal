import { getUserByAuthServiceId } from "@/app/api/db";
import { getSession, withApiAuthRequired } from "@auth0/nextjs-auth0";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

export const GET = withApiAuthRequired(async function myApiRoute(req, res) {
  const urlParts = req.nextUrl.pathname.split("/");
  const corpusKey = urlParts[urlParts.length - 1];
  const pageKey = req.nextUrl.searchParams.get("pageKey");

  const session = await getSession(req as NextRequest, res as NextResponse);

  if (!session) {
    return NextResponse.json(
      {
        error: "There was an error retrieving corpus documents.",
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

  const { vectara_personal_api_key: apiKey } = internalUserData;

  if (!apiKey) {
    return NextResponse.json(
      {
        error: "Insufficient credentials to get documents.",
      },
      { status: 400 }
    );
  }

  const success = await getDocumentsForCorpus(
    corpusKey,
    apiKey,
    pageKey
  );

  return NextResponse.json(
    {
      success,
    },
    { status: success ? 200 : 400 }
  );
});

const getDocumentsForCorpus = async (
  corpusKey: string,
  apiKey: string,
  pageKey: string | null
) => {
  const data = JSON.stringify({
    limit: 10,
    pageKey: pageKey ?? null,
  });

  const config = {
    method: "get",
    maxBodyLength: Infinity,
    url: `https://api.vectara.io/v2/corpora/${corpusKey}/documents`,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "x-api-key": apiKey,
    },
    data: data,
  };

  const resp = await axios(config);
  return resp.data;
};
