import { Pool } from 'pg';

const pool = new Pool({
  host: 'DFast-9.cloud.neon.tech',
  port: 5432,
  database: 'neondb',
  user: 'neondb_owner',
  password: 'ed67NaiwgnxP',
  ssl: { rejectUnauthorized: false },
});

export const query = (text: string, params?: any[]) => pool.query(text, params);

// import { Pool } from "pg";

// const pool = new Pool({
//   user: "neondb_owner",
//   host: "DFast-9.cloud.neon.tech",
//   database: "neondb",
//   password: "ed67NaiwgnxP",
//   port: 5432, // Default PostgreSQL port
// });

// export const query = (text: string, params?: any[]) => pool.query(text, params);

