import re

with open('src/components/WalletTopupModal.tsx', 'r') as f:
    code = f.read()

# Update dynamic yield block to also show token amount
input_block_search = r"\{/\* Dynamic Yield Estimation \*/\}\n                  <div className=\"mt-4 p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/20 flex items-center gap-3 animate-in fade-in\">\n                    <Sparkles className=\"w-5 h-5 text-emerald-400 shrink-0\" />\n                    <span className=\"text-\[11px\] leading-tight font-medium text-emerald-300\">\n                      \{getYieldEstimation\(amount\)\}\n                    </span>\n                  </div>"
input_block_replace = """{/* Dynamic Yield Estimation */}
                  <div className="mt-4 p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/20 flex flex-col gap-2 animate-in fade-in">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-emerald-400 shrink-0" />
                      <span className="text-sm font-bold font-mono text-emerald-300">
                        You Will Receive: {isNaN(parseFloat(amount)) || parseFloat(amount) <= 0 ? 0 : (parseFloat(amount) * 10).toLocaleString()} Studio Tokens
                      </span>
                    </div>
                    <p className="text-[11px] leading-tight font-medium text-emerald-400/80 ml-7">
                      {getYieldEstimation(amount)}
                    </p>
                  </div>"""

code = re.sub(input_block_search, input_block_replace, code)

with open('src/components/WalletTopupModal.tsx', 'w') as f:
    f.write(code)

