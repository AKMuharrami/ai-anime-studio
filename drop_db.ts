import { db } from './src/db';
import { sql } from 'drizzle-orm';

async function drop() {
  console.log("Dropping schema...");
  await db.execute(sql`DROP SCHEMA public CASCADE;`);
  console.log("Creating schema...");
  await db.execute(sql`CREATE SCHEMA public;`);
  console.log("Done.");
  process.exit(0);
}
drop();
