import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema.ts';

// We allow starting the server without DATABASE_URL in order to show the UI
// but any actual DB call will fail or be intercepted if the URL is missing.
const connectionString = process.env.DATABASE_URL || 'postgresql://mock:mock@mock.neon.tech/mock?sslmode=require';
const sql = neon(connectionString);

export const db = drizzle(sql, { schema });

export const checkDbReady = () => {
  if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes('mock.neon.tech')) {
    throw new Error('DATABASE_URL is missing. Please configure your Neon Postgres database in the .env file.');
  }
};
