import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./schema";

const pool = mysql.createPool({
  host: "gateway01.ap-southeast-1.prod.aws.tidbcloud.com",
  port: 4000,
  user: "3iGeCrgiwUD7Avn.root",
  password: "3VnbwZGgiUL4ixQw",
  database: "fydp_hub",
  ssl: {
    rejectUnauthorized: false,
  },
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export const db = drizzle(pool, { schema, mode: "default" });