// TODO: Split these so we don't have one giant bucket of db functions.
import { PortalType } from "@/app/types";
const pg = require("pg");

const pool = new pg.Pool({
  connectionString: `postgresql://${process.env.PG_USER}:${process.env.PG_PASSWORD}@${process.env.PG_HOST}:${process.env.PG_PORT}/${process.env.PG_NAME}?sslmode=${process.env.PG_SSL_MODE}`,
});

/* PORTALS */

// TODO: Use sendQuery util
export const getPortalsForUser = (userId: string) => {
  return pool.connect().then((client: any) => {
    return client
      .query(
        `select * from portals where owner_id = ${userId} and is_deleted != 'true'`
      )
      .then((resolved: any) => {
        client.release();
        return resolved.rows;
      })
      .catch((e: string) => {
        client.release();
        console.log("error", e);
      });
  });
};

export const createPortalForUser = (
  name: string,
  corpusId: string,
  corpusKey: string,
  type: string,
  description: string,
  key: string,
  ownerId: number,
  isRestricted: boolean,
  vectaraCustomerId: string,
  vectaraApiKey: string
) => {
  const sanitizedName = name.replace(/'/g, "''");
  const sanitizedDescription = description.replace(/'/g, "''");

  return sendQuery(`
    INSERT INTO 
      portals (name, vectara_corpus_id, vectara_corpus_key, type, description, key, is_restricted, owner_id, vectara_customer_id, vectara_api_key)
      VALUES ('${sanitizedName}', '${corpusId}', '${corpusKey}', '${type}', '${sanitizedDescription}', '${key}', ${isRestricted}, ${ownerId}, '${vectaraCustomerId}', '${vectaraApiKey}');`);
};

export const deletePortal = (key: string) => {
  return sendQuery(`UPDATE portals SET is_deleted='true' WHERE key='${key}'`);
};

export const updatePortal = (
  key: string,
  name?: string,
  isRestricted?: boolean,
  type?: PortalType,
  description?: string
) => {
  const params: Record<string, string | boolean | PortalType | undefined> = {
    name,
    isRestricted,
    type,
    description,
  };

  const setParts: Array<string> = [];

  Object.keys(params).forEach((key) => {
    if (params[key] !== undefined) {
      let sanitizedKey = key === "isRestricted" ? "is_restricted" : key;
      setParts.push(`${sanitizedKey} = '${params[key]}'`);
    }
  });

  return sendQuery(
    `UPDATE portals SET ${setParts.join(",")} WHERE key='${key}' returning *`
  );
};

export const getPortalByKey = (key: string) => {
  return sendQuery(
    `select * from portals where key = '${key}' and is_deleted != 'true';`,
    (resolved) => resolved.rows?.[0] ?? null
  );
};

export const getAuthedUserIdsForPortal = (portalKey: string) => {
  return sendQuery(
    `SELECT 
     t2.user_id as authorized_id
     FROM portals t1 
     INNER JOIN user_group_memberships t2 on t1.owner_id = t2.inviter_id
     WHERE t1.key='${portalKey}'AND t2.state='accepted';
    `,
    (resolved) => resolved.rows ?? null
  );
};

/* USERS */

export const createUser = (
  email: string,
  authServiceId: string,
  role: string = "admin"
) => {
  return sendQuery(
    `INSERT INTO users (email, auth_service_id, role) VALUES ('${email}', '${authServiceId}', '${role}') ON CONFLICT (auth_service_id) DO NOTHING RETURNING *;`,
    (resolved) => resolved.rows?.[0] ?? null
  );
};

export const updateUser = (
  userId: number,
  vectaraCustomerId?: string,
  vectaraPersonalApiKey?: string,
  vectaraOAuth2ClientId?: string,
  vectaraOAuth2ClientSecret?: string,
  isVectaraScaleUser?: boolean
) => {
  console.log(
    vectaraCustomerId,
    vectaraPersonalApiKey,
    vectaraOAuth2ClientId,
    vectaraOAuth2ClientSecret,
    isVectaraScaleUser
  );
  return sendQuery(
    `UPDATE users SET vectara_customer_id = ${
      vectaraCustomerId ? `'${vectaraCustomerId}'` : "NULL"
    }, vectara_personal_api_key='${
      vectaraPersonalApiKey ?? "NULL"
    }', oauth2_client_id='${
      vectaraOAuth2ClientId ?? "NULL"
    }', oauth2_client_secret='${
      vectaraOAuth2ClientSecret ?? "NULL"
    }', is_vectara_scale_user='${isVectaraScaleUser ?? false}'
    WHERE id='${userId}' RETURNING *;`
  );
};

export const updateUserAuthServiceId = (
  userId: number,
  authServiceId: string
) => {
  return sendQuery(
    `UPDATE users SET auth_service_id = '${authServiceId}' RETURNING *;`
  );
};

export const getUserByEmail = (email: string) => {
  return sendQuery(
    `SELECT * FROM users where email = '${email}';`,
    (resolved) => resolved.rows?.[0] ?? null
  );
};

export const getUserById = (id: number) => {
  return sendQuery(
    `SELECT * FROM users where id = '${id}';`,
    (resolved) => resolved.rows?.[0] ?? null
  );
};

export const getUsersById = (ids: Array<number>) => {
  return sendQuery(
    `SELECT * FROM users where id = ANY(ARRAY[${ids.join(",")}]::integer[]);`,
    (resolved) => resolved.rows ?? null
  );
};

export const getUserByAuthServiceId = (authServiceId: string) => {
  return sendQuery(
    `SELECT * FROM users where auth_service_id = '${authServiceId}';`,
    (resolved) => resolved.rows?.[0] ?? null
  );
};

export const getUserIdsForParentUserId = (id: number) => {
  return sendQuery(
    `SELECT users_ids FROM users where id = '${id}';`,
    (resolved) => resolved.rows?.[0] ?? null
  );
};

/* USER GROUPS */

export const getUserGroupsForUser = (ownerId: number) => {
  const q = `SELECT *
  FROM user_groups
  WHERE owner_id = '${ownerId}'`;
  return sendQuery(q, (resolved) => resolved.rows ?? null);
};

export const addUserToUserGroup = (
  user_id: number,
  user_group_id: number,
  inviter_id: number
) => {
  return sendQuery(
    `INSERT INTO user_group_memberships (user_id, user_group_id, state, inviter_id) VALUES ('${user_id}', '${user_group_id}', 'pending', '${inviter_id}');`
  );
};

/* USER GROUP */

export const createDefaultUserGroupForUser = (ownerId: number) => {
  return sendQuery(
    `INSERT INTO user_groups (name, owner_id) VALUES ('default', '${ownerId}');`,
    (resolved) => resolved.rows?.[0] ?? null
  );
};

export const getUserGroup = (groupId: number) => {
  const q = `SELECT *
  FROM user_groups
  WHERE id = '${groupId}'`;
  return sendQuery(q, (resolved) => resolved.rows?.[0] ?? null);
};

/* USER GROUP MEMBERSHIPS */

export const getUserGroupMemberships = (userGroupId: number) => {
  return sendQuery(
    `SELECT * from user_group_memberships where user_group_id='${userGroupId}' ORDER BY ID DESC`,
    (resolved) => resolved.rows ?? null
  );
};

export const getPendingUserGroupMembershipsForUser = (userId: number) => {
  return sendQuery(
    `SELECT 
     t1.id as invite_id,
     t3.email as inviter_email
     FROM user_group_memberships t1
     INNER JOIN user_groups t2 ON t1.user_group_id = t2.id
     INNER JOIN users t3 ON t2.owner_id = t3.id
     WHERE T1.user_id = '${userId}' AND t1.state = 'pending' ORDER BY invite_id DESC`,
    (resolved) => resolved.rows ?? null
  );
};

export const acceptUserGroupMembership = (
  userId: number,
  membershipId: number
) => {
  return sendQuery(
    `UPDATE user_group_memberships SET state='accepted' WHERE id='${membershipId}' and user_id='${userId}' returning id, state;`,
    (resolved) => resolved.rows ?? null
  );
};

export const rejectUserGroupMembership = (
  userId: number,
  membershipId: number
) => {
  return sendQuery(
    `UPDATE user_group_memberships SET state='rejected' WHERE id='${membershipId}' and user_id='${userId}' returning id, state;`,
    (resolved) => resolved.rows ?? null
  );
};

export const revokeUserGroupMembership = (
  inviterId: number,
  membershipId: number
) => {
  return sendQuery(
    `UPDATE user_group_memberships SET state='revoked' WHERE id='${membershipId}' and inviter_id='${inviterId}' returning id, state;`,
    (resolved) => resolved.rows ?? null
  );
};

export const resendUserGroupMembership = (
  userId: number,
  membershipId: number
) => {
  return sendQuery(
    `UPDATE user_group_memberships SET state='pending' WHERE id='${membershipId}' and inviter_id='${userId}' returning id, state;`,
    (resolved) => resolved.rows ?? null
  );
};

const sendQuery = async (
  query: string,
  onSuccess: (resolved: any) => void = (resolved) => {
    return resolved.rows;
  }
) => {
  return pool.connect().then((client: any) => {
    return client
      .query(query)
      .then((resolved: any) => {
        client.release();
        return onSuccess(resolved);
      })
      .catch((e: string) => {
        client.release();
        console.log("error", e);
      });
  });
};
