import axios from "axios";

export const useUserGroup = () => {
  const getMemberships = async (groupId: string) => {
    try {
      const response = await axios({
        method: "get",
        url: `/api/group/${groupId}`,
      });

      return response.data.group_memberships.map(
        (membership: {
          id: number;
          group_id: number;
          user_id: number;
          email: string;
          state: string;
        }) => ({
          id: membership.id,
          groupId: membership.group_id,
          userId: membership.user_id,
          email: membership.email,
          state: membership.state,
        })
      );
    } catch {}
  };

  return {
    getMemberships,
  };
};
