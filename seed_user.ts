import { db } from './src/db';
import { users } from './src/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

async function seed() {
  console.log("Seeding user...");
  const passwordHash = await bcrypt.hash('5December', 10);
  
  const user = await db.insert(users).values({
    email: 'akmuharrami@gmail.com',
    password_hash: passwordHash,
    is_verified: true,
    wallet_balance: 10000.0, // Give massive balance to admin
    subscription_tier: 'ENTERPRISE',
    subscription_status: 'ACTIVE'
  }).onConflictDoUpdate({
    target: users.email,
    set: {
      password_hash: passwordHash,
      is_verified: true,
      wallet_balance: 10000.0, // Give massive balance to admin
      subscription_tier: 'ENTERPRISE',
      subscription_status: 'ACTIVE'
    }
  }).returning();
  console.log("User seeded successfully:", user);
  process.exit(0);
}
seed().catch(err => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
