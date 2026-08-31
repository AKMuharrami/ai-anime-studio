import re

with open('src/components/Navbar.tsx', 'r') as f:
    code = f.read()

# Update Wallet Pill
pill_search = r"<span className=\"font-mono font-bold\">\$\{walletBalance\.toFixed\(2\)\}</span>"
pill_replace = """<span className="font-mono font-bold">{(walletBalance * 10).toLocaleString()} <span className="text-[10px] text-emerald-500/80">TOKENS</span></span>"""
code = re.sub(pill_search, pill_replace, code)

with open('src/components/Navbar.tsx', 'w') as f:
    f.write(code)

