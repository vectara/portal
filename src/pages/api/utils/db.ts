import { PortalType } from "@/app/types";

const pg = require("pg");

const pool = new pg.Pool({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_NAME,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
  ssl: {
    rejectUnauthorized: true,
    ca: process.env.PG_PEM,
  },
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
  type: string,
  description: string,
  key: string,
  ownerId: number,
  isRestricted: boolean,
  vectaraCustomerId: string,
  vectaraApiKey: string
) => {
  return sendQuery(
    `INSERT INTO portals (name, vectara_corpus_id, type, description, key, is_restricted, owner_id, vectara_customer_id, vectara_api_key) VALUES ('${name}', '${corpusId}', '${type}', '${description}', '${key}', ${isRestricted}, ${ownerId}, '${vectaraCustomerId}', '${vectaraApiKey}');`
  );
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
    if (params[key]) {
      setParts.push(`${key} = '${params[key]}'`);
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

/* USERS */

export const createUser = (
  email: string,
  authServiceId: string,
  role: string = "admin"
) => {
  return sendQuery(
    `INSERT INTO users (email, auth_service_id, role) VALUES ('${email}', '${authServiceId}', '${role}') ON CONFLICT (auth_service_id) DO NOTHING RETURNING id;`,
    (resolved) => resolved.rows?.[0] ?? null
  );
};

export const updateUser = (
  userId: number,
  vectaraCustomerId?: string,
  vectaraPersonalApiKey?: string,
  vectaraOAuth2ClientId?: string,
  vectaraOAuth2ClientSecret?: string
) => {
  return sendQuery(
    `UPDATE users SET vectara_customer_id = ${
      vectaraCustomerId ? `'${vectaraCustomerId}'` : "NULL"
    }, vectara_personal_api_key='${
      vectaraPersonalApiKey ?? "NULL"
    }', oauth2_client_id='${
      vectaraOAuth2ClientId ?? "NULL"
    }', oauth2_client_secret='${
      vectaraOAuth2ClientSecret ?? "NULL"
    }' WHERE id='${userId}' RETURNING *;`
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

export const getUsersFromIds = (ids: Array<number>) => {
  const q = `SELECT *
  FROM users
  WHERE id in (${ids.join(",")})`;
  return sendQuery(q, (resolved) => resolved.rows ?? null);
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
