import axios from "axios";

export const useUserGroups = (userId: string) => {
  const getUserGroups = async () => {
    try {
      const response = await axios({
        method: "get",
        url: `/api/groups/${userId}`,
      });

      return response.data.groups.map(
        (group: { id: string; owner_id: string; name: string }) => ({
          id: group.id,
          ownerId: group.owner_id,
          name: name,
        })
      );
    } catch {}
  };

  // TODO: move to useUserGroup.ts
  const inviteUserToGroup = async (groupId: string, email: string) => {
    try {
      await axios({
        method: "post",
        url: `/api/user/invite`,
        data: {
          email,
          user_group_id: groupId,
        },
      });

      return true;
    } catch {
      return false;
    }
  };

  const removeUserFromGroup = async (groupId: string, email: string) => {};

  return {
    getUserGroups,
    inviteUserToGroup,
    removeUserFromGroup,
  };
};
