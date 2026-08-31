import re

with open('src/components/WalletTopupModal.tsx', 'r') as f:
    code = f.read()

# Update tiers list
tiers_search = r"const tiers = \[\s*\{\s*id: 'STARTER'[\s\S]*?\}\s*\];"
tiers_replace = """const tiers = [
    {
      id: 'STARTER',
      name: 'Starter Creator',
      price: '$99/mo',
      amount: '99.00',
      icon: <Zap className="w-5 h-5 text-emerald-400" />,
      features: ['1,000 Studio Tokens', '720p Video Exports', 'Standard Queue Priority']
    },
    {
      id: 'PRO',
      name: 'Pro Studio',
      price: '$399/mo',
      amount: '399.00',
      icon: <Layers className="w-5 h-5 text-indigo-400" />,
      features: ['5,000 Studio Tokens', '4K Video Exports', 'High Queue Priority', 'Priority Support']
    },
    {
      id: 'ENTERPRISE',
      name: 'Enterprise',
      price: '$1299/mo',
      amount: '1299.00',
      icon: <Server className="w-5 h-5 text-rose-400" />,
      features: ['20,000 Studio Tokens', 'Custom API Access', 'White-glove Support', 'Team Collaboration']
    }
  ];"""
code = re.sub(tiers_search, tiers_replace, code)

# Update the display of current balance to include Tokens
balance_search = r"<div className=\"text-3xl font-bold font-mono text-emerald-400 flex items-center gap-3\">\s*\$\{currentBalance\.toFixed\(2\)\}\s*<span"
balance_replace = """<div className="text-3xl font-bold font-mono text-emerald-400 flex items-center gap-3">
              {(currentBalance * 10).toLocaleString()} <span className="text-sm text-emerald-500/70">Tokens</span>
              <span"""
code = re.sub(balance_search, balance_replace, code)

# Update Top-up amount label
topup_label_search = r"<label className=\"block text-xs font-semibold text-slate-300 mb-3 uppercase tracking-wider\">\s*Select Top-Up Amount\s*</label>"
topup_label_replace = """<label className="block text-xs font-semibold text-slate-300 mb-3 uppercase tracking-wider">
                  Select Top-Up Amount (1 USD = 10 Tokens)
                </label>"""
code = re.sub(topup_label_search, topup_label_replace, code)


with open('src/components/WalletTopupModal.tsx', 'w') as f:
    f.write(code)

