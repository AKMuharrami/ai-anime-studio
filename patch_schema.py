import re

with open('src/db/schema.ts', 'r') as f:
    code = f.read()

user_table_search = r"wallet_balance: real\('wallet_balance'\)\.default\(100\.0\)\.notNull\(\), // Strictly >= 0\.00"
user_table_replace = """wallet_balance: real('wallet_balance').default(100.0).notNull(), // Strictly >= 0.00
  subscription_tier: text('subscription_tier').default('FREE').notNull(),
  subscription_status: text('subscription_status').default('INACTIVE').notNull(),"""
code = re.sub(user_table_search, user_table_replace, code)

with open('src/db/schema.ts', 'w') as f:
    f.write(code)

