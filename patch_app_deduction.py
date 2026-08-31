import re

with open('src/App.tsx', 'r') as f:
    code = f.read()

deduction_logic = """  // Token Deduction Engine
  const deductTokens = async (tokenCost: number, reason: string): Promise<boolean> => {
    // 1 USD = 10 Tokens. We store wallet_balance in USD natively.
    const usdCost = tokenCost / 10;
    
    if (user.wallet_balance < usdCost) {
      alert(`Insufficient Studio Tokens!\\nCost: ${tokenCost} Tokens.\\nYou have: ${(user.wallet_balance * 10).toLocaleString()} Tokens.\\n\\nPlease Top-Up to continue ${reason}.`);
      setIsTopupModalOpen(true);
      return false;
    }
    
    // Deduct immediately in optimistic UI state
    setUser(prev => ({
      ...prev,
      wallet_balance: Math.max(0, prev.wallet_balance - usdCost)
    }));
    
    // In a full production build, we'd hit /api/wallet/deduct here.
    return true;
  };
"""

code = code.replace("  // Project Creation", deduction_logic + "\n  // Project Creation")

# Pass deductTokens to components
# Find <ScriptTimelineParserTab ... />
script_search = r"(<ScriptTimelineParserTab[\s\S]*?onBatchAddEntities=\{handleBatchAddEntities\})"
script_replace = r"\1\n                    deductTokens={deductTokens}"
code = re.sub(script_search, script_replace, code)

vault_search = r"(<StudioDesignVaultTab[\s\S]*?onBackToScript=\{[\s\S]*?\})"
vault_replace = r"\1\n                    deductTokens={deductTokens}"
code = re.sub(vault_search, vault_replace, code)

seedance_search = r"(<SeedanceMultimodalStudioTab[\s\S]*?onBackToVault=\{[\s\S]*?\})"
seedance_replace = r"\1\n                    deductTokens={deductTokens}"
code = re.sub(seedance_search, seedance_replace, code)

sound_search = r"(<SoundVoiceStudioTab[\s\S]*?onBackToSeedance=\{[\s\S]*?\})"
sound_replace = r"\1\n                    deductTokens={deductTokens}"
code = re.sub(sound_search, sound_replace, code)

timeline_search = r"(<TimelineCompilerTab[\s\S]*?onBackToHome=\{[\s\S]*?\})"
timeline_replace = r"\1\n                    deductTokens={deductTokens}"
code = re.sub(timeline_search, timeline_replace, code)

with open('src/App.tsx', 'w') as f:
    f.write(code)

