import { db } from './src/db';
import { sql } from 'drizzle-orm';

async function test() {
  const result = await db.execute(sql`SELECT column_name FROM information_schema.columns WHERE table_name = 'users'`);
  console.log(result);
  process.exit(0);
}
test();
