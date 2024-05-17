import {
  deletePortal,
  getAuthedUserIdsForPortal,
  getPortalByKey,
  getUserByAuthServiceId,
  updatePortal,
} from "@/pages/api/utils/db";
import { getSession, withApiAuthRequired } from "@auth0/nextjs-auth0";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";
import { sendApiResponse } from "../../utils";

export const GET = async (req: NextRequest) => {
  const urlParts = req.url.split("/");
  const portalKey = urlParts[urlParts.length - 1];
  const portal = await getPortalByKey(portalKey);

  if (!portal.is_restricted) {
    return sendApiResponse({ portal }, 200);
  }

  const session = await getSession();
  if (!session) {
    return sendApiResponse({ error: "Not authorized" }, 401);
  }

  const internalUserData = await getUserByAuthServiceId(session.user.sub);
  if (!internalUserData) {
    return sendApiResponse({ error: "Could not find logged in user" }, 500);
  }

  const authedUserIds = (await getAuthedUserIdsForPortal(portalKey)).map(
    (authedUserId: any) => authedUserId.authorized_id
  );
  if (portal.owner_id === internalUserData.id) {
    authedUserIds.push(internalUserData.id);
  }

  if (!authedUserIds.includes(internalUserData.id)) {
    return sendApiResponse({ error: "Not authorized" }, 401);
  }

  return sendApiResponse(
    {
      portal,
    },
    200
  );
};

export const PATCH = withApiAuthRequired(async function myApiRoute(req, res) {
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

  const { key, name, isRestricted, type, description } = await req.json();

  if (!name && !key && !isRestricted && !type && !description) {
    return NextResponse.json(
      {
        error:
          "One of (key, name, isRestricted, type, description) is required",
      },
      { status: 400 }
    );
  }

  const portal = await updatePortal(key, name, isRestricted, type, description);

  return NextResponse.json(
    {
      portal,
    },
    { status: 200 }
  );
});

export const DELETE = withApiAuthRequired(async function myApiRoute(req, res) {
  const session = await getSession(req as NextRequest, res as NextResponse);
  const urlParts = req.url.split("/");
  const portalKey = urlParts[urlParts.length - 1];

  if (!portalKey) {
    return NextResponse.json(
      {
        error: "key is required",
      },
      { status: 400 }
    );
  }

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
        error: "There was an error deleting your portal.",
      },
      { status: 500 }
    );
  }

  const portal = await getPortalByKey(portalKey);

  if (portal.owner_id !== internalUserData.id) {
    return NextResponse.json(
      {
        error: "You are not authorized to delete this portal",
      },
      { status: 401 }
    );
  }

  await deletePortal(portalKey);
  await deleteCorpus(
    portal.vectara_corpus_id,
    internalUserData.vectara_personal_api_key
  );

  return NextResponse.json(
    {
      message: "Portal deleted",
    },
    { status: 200 }
  );
});

const deleteCorpus = async (corpusId: string, apiKey: string) => {
  const data = JSON.stringify({
    corpusId,
  });

  const config = {
    method: "post",
    maxBodyLength: Infinity,
    url: "https://api.vectara.io/v1/delete-corpus",
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
