import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from './schema';

const connectionUri = process.env.DATABASE_URL || 'mysql://3iGeCrgiwUD7Avn.root:3VnbwZGgiUL4ixQw@gateway01.ap-southeast-1.prod.aws.tidbcloud.com:4000/fydp_hub';

const pool = mysql.createPool({
  uri: connectionUri,
  ssl: {
    rejectUnauthorized: false,
  },
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export const db = drizzle(pool, { schema, mode: 'default' });