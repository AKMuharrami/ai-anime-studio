import re

with open('src/types.ts', 'r') as f:
    code = f.read()

# Add subscription info to User
user_search = r'export interface User \{\n  id: string;\n  email: string;\n  wallet_balance: number; // Strictly >= 0.00\n  created_at: string;\n\}'
user_replace = """export type SubscriptionTier = 'FREE' | 'STARTER' | 'PRO' | 'ENTERPRISE';

export interface User {
  id: string;
  email: string;
  wallet_balance: number; // Strictly >= 0.00
  subscription_tier?: SubscriptionTier;
  subscription_status?: 'ACTIVE' | 'INACTIVE';
  created_at: string;
}"""
code = re.sub(user_search, user_replace, code)

with open('src/types.ts', 'w') as f:
    f.write(code)

