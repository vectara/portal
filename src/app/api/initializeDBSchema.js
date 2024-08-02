const pg = require("pg");

const pool = new pg.Pool({
    connectionString: `postgresql://${process.env.PG_USER}:${process.env.PG_PASSWORD}@${process.env.PG_HOST}:${process.env.PG_PORT}/${process.env.PG_NAME}?sslmode=${process.env.PG_SSL_MODE}`
});

const schema = `CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  vectara_customer_id VARCHAR,
  vectara_personal_api_key VARCHAR,
  role VARCHAR NOT NULL,
  auth_service_id VARCHAR UNIQUE NOT NULL,
  email VARCHAR UNIQUE NOT NULL,
  oauth2_client_id VARCHAR,
  oauth2_client_secret VARCHAR
);

CREATE TABLE IF NOT EXISTS portals (
  name VARCHAR,
  vectara_corpus_id VARCHAR NOT NULL,
  type VARCHAR,
  key VARCHAR PRIMARY KEY,
  is_restricted BOOLEAN DEFAULT false,
  allowed_user_ids INTEGER[],
  owner_id INTEGER,
  vectara_customer_id VARCHAR,
  vectara_api_key VARCHAR,
  description TEXT,
  is_deleted BOOLEAN DEFAULT false,
  CONSTRAINT owner_id_fk FOREIGN KEY (owner_id)
    REFERENCES public.users (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
);

CREATE TABLE IF NOT EXISTS user_groups (
  id SERIAL PRIMARY KEY,
  name VARCHAR NOT NULL,
  owner_id INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS user_group_memberships (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  user_group_id INTEGER NOT NULL,
  state VARCHAR NOT NULL,
  inviter_id INTEGER
);
`

async function initializeDatabase() {
    const client = await pool.connect();
    try {
        const result = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name IN ('users', 'portals', 'user_groups', 'user_group_memberships')
      );
    `);
        const tableExists = result.rows.some((row) => row.exists);

        if (!tableExists) {
            console.log('Tables do not exist. Creating tables...');
            await client.query(schema);
            console.log('Database schema created successfully');
        } else {
            console.log('Tables already exist. Skipping schema creation');
        }
    } catch (error) {
        console.error('Error checking/creating database schema:', error);
    } finally {
        client.release();
    }
}

initializeDatabase().catch((err) => {
    console.error('Failed to initialize database:', err);
});
