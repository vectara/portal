import axios from "axios";
import { sendApiResponse, withLoginVerification } from "../../utils";
import {
  addUserToUserGroup,
  createUser,
  getUserByEmail,
} from "@/pages/api/utils/db";

import { ManagementClient, AuthenticationClient } from "auth0";

var management = new ManagementClient({
  domain: process.env.AUTH0_MACHINE_TO_MACHINE_DOMAIN!,
  clientId: process.env.AUTH0_MACHINE_TO_MACHINE_CLIENT_ID!,
  clientSecret: process.env.AUTH0_MACHINE_TO_MACHINE_CLIENT_SECRET!,
});

var auth = new AuthenticationClient({
  domain: process.env.AUTH0_MACHINE_TO_MACHINE_DOMAIN!,
  clientId: process.env.AUTH0_MACHINE_TO_MACHINE_CLIENT_ID!,
  clientSecret: process.env.AUTH0_MACHINE_TO_MACHINE_CLIENT_SECRET!,
});

import { generate as generatePassword } from "generate-password";

// TODO: Maybe move under /invitations???

export const POST = withLoginVerification(async (loggedInUser, req, res) => {
  const { email, user_group_id } = await req.json();
  // Create the user if necessary
  let registeredUser = await getUserByEmail(email);
  await requestPasswordChange(registeredUser.email);

  if (!registeredUser) {
    try {
      // If we still have to create the user, they'll get an email invite
      // and we'll continue create a group membership upon accepting the invite
      const authServiceUser = await createAuthServiceUser(
        email,
        loggedInUser.email
      );
      registeredUser = await createUser(email, authServiceUser.user_id);

      if (!registeredUser) {
        return sendApiResponse({ error: "error sending invitation" }, 500);
      }

      await requestPasswordChange(registeredUser.email);
    } catch {}
  }

  // Create a membership
  await createGroupMembership(
    registeredUser.id,
    user_group_id,
    loggedInUser.id
  );
  return sendApiResponse({ message: "invite sent" }, 200);
});

const createAuthServiceUser = async (email: string, invitedByEmail: string) => {
  const response = await management.users.create({
    email,
    email_verified: false,
    connection: "Username-Password-Authentication",
    verify_email: false,
    user_metadata: {
      invited_by_email: invitedByEmail,
    },
    password: generatePassword({
      length: 8,
      symbols: true,
      lowercase: true,
      uppercase: true,
      numbers: true,
    }),
  });

  return response.data;
};

const requestPasswordChange = async (userEmail: string) => {
  const response = await auth.database.changePassword({
    connection: "Username-Password-Authentication",
    email: userEmail,
  });

  return response.data;
};

const createGroupMembership = async (
  userId: number,
  groupId: number,
  inviterId: number
) => {
  await addUserToUserGroup(userId, groupId, inviterId);
};
