import { getUserByAuthServiceId } from "@/app/api/db";
import { getSession, withApiAuthRequired } from "@auth0/nextjs-auth0";
import formidable from "formidable";
import { NextRequest, NextResponse } from "next/server";
import { Blob as BlobConstructor } from "buffer";

import fs from "fs";
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

  const { vectara_customer_id: customerId, vectara_personal_api_key: apiKey } =
    internalUserData;

  if (!apiKey || !customerId) {
    return NextResponse.json(
      {
        error: "Insufficient credentials to upload file",
      },
      { status: 400 }
    );
  }

  const success = await uploadFile(req, customerId, apiKey);

  return NextResponse.json(
    {
      success,
    },
    { status: success ? 200 : 400 }
  );
});

const uploadFile = async (
  req: NextRequest,
  customerId: string,
  apiKey: string
) => {
  const form = formidable({});
  try {
    const inboundFormData = await req.formData();
    const corpusId = inboundFormData.get("corpusId");
    const file = inboundFormData.get("file");

    if (!customerId || !corpusId || !file) {
      return false;
    }

    const outboundFormData = new FormData();
    outboundFormData.append("file", file as Blob, (file as any).name as string);

    const config = {
      method: "post",
      maxBodyLength: Infinity,
      url: `https://api.vectara.io/v1/upload?c=${customerId}&o=${corpusId}`,
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
