import re

with open('src/components/WalletTopupModal.tsx', 'r') as f:
    code = f.read()

# Add Sparkles to lucide-react import
import_search = r"import \{ CreditCard, X, Plus, ShieldCheck, Zap, Layers, Server \} from 'lucide-react';"
import_replace = r"import { CreditCard, X, Plus, ShieldCheck, Zap, Layers, Server, Sparkles } from 'lucide-react';"
code = re.sub(import_search, import_replace, code)

# Add Yield Estimator function
func_search = r"  const \[selectedTier, setSelectedTier\] = useState<string \| null>\(null\);\n\n  if \(\!isOpen\) return null;"
func_replace = """  const [selectedTier, setSelectedTier] = useState<string | null>(null);

  const getYieldEstimation = (usdAmount: string) => {
    const val = parseFloat(usdAmount);
    if (isNaN(val) || val <= 0) return "Enter an amount to see production yield.";
    const tokens = val * 10;
    
    if (tokens < 250) return "Yields: Character concepts & a few manga pages.";
    if (tokens < 500) return "Yields: 1 Short Manga Chapter (15 pages) or 1 Anime Scene.";
    if (tokens < 1000) return "Yields: 1 Standard Manga Chapter (30 pages) or 2 Anime Scenes.";
    if (tokens < 2500) return "Yields: 1 Extended Manga Chapter (60 pages) or an Anime Teaser Trailer.";
    if (tokens < 5000) return "Yields: 3 Full Manga Chapters or 1 Complete Anime Episode.";
    if (tokens < 10000) return "Yields: 1 Full Manga Volume (10 chapters) or 2 Anime Episodes.";
    return "Yields: Multi-Volume Manga Series or Full Anime Production Season.";
  };

  if (!isOpen) return null;"""
code = re.sub(func_search, func_replace, code)

# Inject dynamic yield block
input_block_search = r"className=\"w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 font-mono focus:outline-none focus:border-emerald-500\"\n                      placeholder=\"Custom amount\.\.\.\"\n                    />\n                  </div>\n                </div>\n\n                \{\/\* No-Debt Rule Callout \*\/\}"
input_block_replace = """className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                      placeholder="Custom amount..."
                    />
                  </div>
                  
                  {/* Dynamic Yield Estimation */}
                  <div className="mt-4 p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/20 flex items-center gap-3 animate-in fade-in">
                    <Sparkles className="w-5 h-5 text-emerald-400 shrink-0" />
                    <span className="text-[11px] leading-tight font-medium text-emerald-300">
                      {getYieldEstimation(amount)}
                    </span>
                  </div>
                </div>

                {/* No-Debt Rule Callout */}"""
code = re.sub(input_block_search, input_block_replace, code)

# Update the features of subscription tiers
tiers_search = r"const tiers = \[\s*\{\s*id: 'STARTER'[\s\S]*?\}\s*\];"
tiers_replace = """const tiers = [
    {
      id: 'STARTER',
      name: 'Starter Creator',
      price: '$99/mo',
      amount: '99.00',
      icon: <Zap className="w-5 h-5 text-emerald-400" />,
      features: ['1,000 Studio Tokens', 'Produces ~1 Full Manga Chapter (60 pages)', 'Or ~1 Anime Teaser Trailer', '720p Video Exports']
    },
    {
      id: 'PRO',
      name: 'Pro Studio',
      price: '$399/mo',
      amount: '399.00',
      icon: <Layers className="w-5 h-5 text-indigo-400" />,
      features: ['5,000 Studio Tokens', 'Produces ~1 Full Manga Volume (10 chapters)', 'Or ~2 Complete Anime Episodes', '4K Video Exports']
    },
    {
      id: 'ENTERPRISE',
      name: 'Enterprise',
      price: '$1299/mo',
      amount: '1299.00',
      icon: <Server className="w-5 h-5 text-rose-400" />,
      features: ['20,000 Studio Tokens', 'Produces ~4 Full Manga Volumes', 'Or a Complete Anime Season', 'Dedicated Server Node']
    }
  ];"""
code = re.sub(tiers_search, tiers_replace, code)


with open('src/components/WalletTopupModal.tsx', 'w') as f:
    f.write(code)

print("Yield estimator patched.")
