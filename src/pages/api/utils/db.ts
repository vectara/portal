import { randomUUID } from "crypto";

const fs = require("fs");
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

export const getPortalsForUser = (vectaraCustomerId: string) => {
  console.log(
    "### QUERY: ",
    `select * from portals where owner_vectara_customer_id = '${vectaraCustomerId}'`
  );
  return pool.connect().then((client: any) => {
    return client
      .query(
        `select * from portals where owner_vectara_customer_id = '${vectaraCustomerId}'`
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
  key: string,
  vectaraCustomerId: string,
  vectaraQueryApiKey: string,
  isRestricted: boolean
) => {
  return sendQuery(
    `INSERT INTO portals VALUES ('${name}', '${corpusId}', '${type}', '${key}', '${vectaraCustomerId}', '${vectaraQueryApiKey}', ${isRestricted});`
  );
};

export const updatePortal = (
  key: string,
  name: string,
  isRestricted: boolean
) => {
  return sendQuery(
    `UPDATE portals SET name = '${name}', is_restricted=${isRestricted} WHERE key='${key}'`
  );
};

export const getPortalByKey = (key: string) => {
  return sendQuery(
    `select * from portals where key = '${key}';`,
    (resolved) => resolved.rows?.[0] ?? null
  );
};

/* USERS */

export const createUser = (
  email: string,
  hashedPassword: string,
  role: string = "admin"
) => {
  return sendQuery(
    `INSERT INTO users (email, password, role) VALUES ('${email}', '${hashedPassword}', '${role}') RETURNING *;`,
    (resolved) => resolved.rows?.[0] ?? null
  );
};

export const updateUser = (
  email: string,
  vectaraCustomerId?: string,
  vectaraPersonalApiKey?: string,
  updatedUsersIdsToAdd: Array<number> = []
) => {
  const q = `UPDATE users SET vectara_customer_id = '${
    vectaraCustomerId ?? "NULL"
  }', vectara_personal_api_key='${
    vectaraPersonalApiKey ?? "NULL"
  }', users_ids = '{${updatedUsersIdsToAdd?.join(
    ","
  )}}'  WHERE email='${email}'`;
  console.log("### QUERY: ", q);
  return sendQuery(q);
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
  console.log("### Q: ", q);
  return sendQuery(q, (resolved) => resolved.rows ?? null);
};

/* SESSIONS */

export const initSession = async (userId: number) => {
  const sessionId = randomUUID();

  await sendQuery(
    `INSERT INTO sessions VALUES ('${userId}', '${sessionId}');`,
    (resolved) => resolved.rows?.[0] ?? null
  );

  return sessionId;
};

export const endSession = (token: string) => {
  const sessionId = randomUUID();

  return sendQuery(
    `DELETE from sessions where token = '${token}';`,
    (resolved) => resolved.rows?.[0] ?? null
  );
};

export const getLoggedInUserForToken = async (token: string) => {
  const session = await sendQuery(
    `SELECT * from sessions where token = '${token}';`,
    (resolved) => resolved.rows?.[0] ?? null
  );

  const user = await getUserById(session.user_id);

  return user;
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
