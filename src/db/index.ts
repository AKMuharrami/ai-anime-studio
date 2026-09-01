import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema.ts';

// We allow starting the server without DATABASE_URL in order to show the UI
// but any actual DB call will fail or be intercepted if the URL is missing.
const connectionString = process.env.DATABASE_URL || 'postgres://default:n8QVwFCmjW3Y@ep-ancient-dust-a1d0xkns-pooler.ap-southeast-1.aws.neon.tech/verceldb?sslmode=require';
const sql = neon(connectionString);

export const db = drizzle(sql, { schema });

export const checkDbReady = () => {
  if (!process.env.DATABASE_URL && connectionString.includes('mock.neon.tech')) {
    throw new Error('DATABASE_URL is missing. Please configure your Neon Postgres database in the .env file.');
  }
};
