import { db } from './src/db';
import { users } from './src/db/schema';
import { eq } from 'drizzle-orm';

async function seed() {
  console.log("Seeding user...");
  const user = await db.insert(users).values({
    email: 'akmuharrami@gmail.com',
    password_hash: 'admin_mock_hash', // Since it's a mock or managed externally
    is_verified: true,
    wallet_balance: 1000.0, // Give some starting balance
    subscription_tier: 'ENTERPRISE',
    subscription_status: 'ACTIVE'
  }).onConflictDoUpdate({
    target: users.email,
    set: {
      is_verified: true,
      wallet_balance: 10000.0, // Give massive balance to admin
      subscription_tier: 'ENTERPRISE',
      subscription_status: 'ACTIVE'
    }
  }).returning();
  console.log("User seeded:", user);
  process.exit(0);
}
seed().catch(err => {
  console.error(err);
  process.exit(1);
});
