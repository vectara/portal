import axios from "axios";

export const useUserGroupInvitations = () => {
  const getInvitations = async () => {
    try {
      const response = await axios({
        method: "get",
        url: `/api/invitations`,
      });

      return response.data.invitations.map(
        (invitation: { invite_id: number; inviter_email: string }) => ({
          id: invitation.invite_id,
          from: invitation.inviter_email,
        })
      );
    } catch {}
  };

  const acceptInvitation = async (invitationId: number) => {
    try {
      const response = await axios({
        method: "post",
        url: `/api/invitations/accept`,
        data: {
          invitationId,
        },
      });

      return response.data;
    } catch {}
  };

  const rejectInvitation = async (invitationId: number) => {
    try {
      const response = await axios({
        method: "post",
        url: `/api/invitations/reject`,
        data: {
          invitationId,
        },
      });

      return response.data;
    } catch {}
  };

  const revokeInvitation = async (invitationId: number) => {
    try {
      const response = await axios({
        method: "post",
        url: `/api/invitations/revoke`,
        data: {
          invitationId,
        },
      });

      return response.data;
    } catch {}
  };

  const resendInvitation = async (invitationId: number) => {
    try {
      const response = await axios({
        method: "post",
        url: `/api/invitations/resend`,
        data: {
          invitationId,
        },
      });

      return response.data;
    } catch {}
  };

  return {
    getInvitations,
    acceptInvitation,
    rejectInvitation,
    revokeInvitation,
    resendInvitation,
  };
};
