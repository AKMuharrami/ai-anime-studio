import { db } from './src/db';
import { users } from './src/db/schema';
import { eq } from 'drizzle-orm';

async function check() {
  const user = await db.select().from(users).where(eq(users.email, 'akmuharrami@gmail.com'));
  console.log(user);
  process.exit(0);
}
check();
