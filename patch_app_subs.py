import re

with open('src/App.tsx', 'r') as f:
    code = f.read()

set_user_search = r"wallet_balance: userData\.wallet_balance,\n          created_at: userData\.created_at \|\| new Date\(\)\.toISOString\(\)\n        \}\);"
set_user_replace = """wallet_balance: userData.wallet_balance,
          subscription_tier: userData.subscription_tier,
          subscription_status: userData.subscription_status,
          created_at: userData.created_at || new Date().toISOString()
        });"""
code = re.sub(set_user_search, set_user_replace, code)

set_user_success_search = r"wallet_balance: userData\.wallet_balance,\n      created_at: new Date\(\)\.toISOString\(\)\n    \}\);"
set_user_success_replace = """wallet_balance: userData.wallet_balance,
      subscription_tier: userData.subscription_tier,
      subscription_status: userData.subscription_status,
      created_at: new Date().toISOString()
    });"""
code = re.sub(set_user_success_search, set_user_success_replace, code)

handle_subscribe = """
  const handleSubscribe = async (tier: string) => {
    try {
      const res = await fetch('/api/wallet/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ tier })
      });
      if (res.ok) {
        const data = await res.json();
        setUser(prev => ({ ...prev, subscription_tier: data.subscription_tier, subscription_status: data.subscription_status }));
      }
    } catch (e) {
      console.error(e);
    }
  };
"""

code = code.replace("const handleTopup = async (amount: number) => {", handle_subscribe + "\n  const handleTopup = async (amount: number) => {")

# Update WalletTopupModal props inside App.tsx
wallet_modal_search = r'<WalletTopupModal\s*isOpen=\{isTopupModalOpen\}\s*onClose=\{\(\) => setIsTopupModalOpen\(false\)\}\s*currentBalance=\{user\.wallet_balance\}\s*onTopup=\{handleTopup\}\s*/>'
wallet_modal_replace = """<WalletTopupModal
        isOpen={isTopupModalOpen}
        onClose={() => setIsTopupModalOpen(false)}
        currentBalance={user.wallet_balance}
        currentTier={user.subscription_tier}
        onTopup={handleTopup}
        onSubscribe={handleSubscribe}
      />"""
code = re.sub(wallet_modal_search, wallet_modal_replace, code)

with open('src/App.tsx', 'w') as f:
    f.write(code)

