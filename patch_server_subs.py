import re

with open('server.ts', 'r') as f:
    code = f.read()

profile_search = r"wallet_balance: user\.wallet_balance,\n      is_verified: user\.is_verified,\n      created_at: user\.created_at\n    \}\);"
profile_replace = """wallet_balance: user.wallet_balance,
      is_verified: user.is_verified,
      subscription_tier: user.subscription_tier,
      subscription_status: user.subscription_status,
      created_at: user.created_at
    });"""
code = re.sub(profile_search, profile_replace, code)

profile_mock_search = r"res\.json\(\{ id: req\.user\?\.id \|\| 'mock', email: req\.user\?\.email \|\| 'mock@example\.com', wallet_balance: 1420\.50, is_verified: true \}\);"
profile_mock_replace = """res.json({ id: req.user?.id || 'mock', email: req.user?.email || 'mock@example.com', wallet_balance: 1420.50, subscription_tier: 'FREE', subscription_status: 'INACTIVE', is_verified: true });"""
code = re.sub(profile_mock_search, profile_mock_replace, code)

subscribe_route = """
// Subscription Route (Mock PayPal/Stripe)
app.post("/api/wallet/subscribe", requireAuth, async (req: AuthRequest, res) => {
  try {
    checkDbReady();
    const { tier } = req.body;
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    // Validate tier
    const validTiers = ['FREE', 'STARTER', 'PRO', 'ENTERPRISE'];
    if (!validTiers.includes(tier)) {
      return res.status(400).json({ error: 'Invalid subscription tier' });
    }

    await db.update(users).set({ 
      subscription_tier: tier,
      subscription_status: 'ACTIVE'
    }).where(eq(users.id, req.user.id));

    res.json({
      success: true,
      message: `Successfully subscribed to ${tier} plan.`,
      subscription_tier: tier,
      subscription_status: 'ACTIVE'
    });
  } catch (error: any) {
    if (error.message.includes('DATABASE_URL')) {
      const { tier } = req.body;
      return res.json({
        success: true,
        message: `[MOCK] Successfully subscribed to ${tier} plan via PayPal.`,
        subscription_tier: tier,
        subscription_status: 'ACTIVE'
      });
    }
    res.status(500).json({ error: error.message });
  }
});
"""

code = code.replace("app.post(\"/api/wallet/topup\", requireAuth", subscribe_route + "\napp.post(\"/api/wallet/topup\", requireAuth")

with open('server.ts', 'w') as f:
    f.write(code)

