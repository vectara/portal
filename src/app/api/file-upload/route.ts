import { getUserByAuthServiceId } from "@/app/api/db";
import { getSession, withApiAuthRequired } from "@auth0/nextjs-auth0";
import formidable from "formidable";
import { NextRequest, NextResponse } from "next/server";

import axios from "axios";

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
        error: "No authorized user found",
      },
      { status: 401 }
    );
  }

  const { vectara_personal_api_key: apiKey } = internalUserData;

  if (!apiKey) {
    return NextResponse.json(
      {
        error: "Insufficient credentials to upload file",
      },
      { status: 400 }
    );
  }

  const success = await uploadFile(req, apiKey);

  return NextResponse.json(
    {
      success,
    },
    { status: success ? 200 : 400 }
  );
});

const uploadFile = async (
  req: NextRequest,
  apiKey: string
) => {
  const form = formidable({});
  try {
    const inboundFormData = await req.formData();
    const corpusKey = inboundFormData.get("corpusKey");
    const file = inboundFormData.get("file");

    if (!corpusKey || !file) {
      return false;
    }

    const outboundFormData = new FormData();
    outboundFormData.append("file", file as Blob, (file as any).name as string);

    const config = {
      method: "post",
      maxBodyLength: Infinity,
      url: `https://api.vectara.io/v2/corpora/${corpusKey}/upload_file`,
      headers: {
        "Content-Type": "multipart/form-data",
        Accept: "application/json",
        "x-api-key": apiKey,
      },
      data: outboundFormData,
    };

    await axios(config);
    return true;
  } catch (err: any) {
    console.error(err);
    return false;
  }
};
