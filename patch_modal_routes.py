import re

with open('src/components/ProjectRouterModal.tsx', 'r') as f:
    code = f.read()

search_grid = r'<label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">\s*Select Project Archetype & Execution Pipeline\s*</label>\s*<div className="grid grid-cols-1 lg:grid-cols-3 gap-4">.*?</div>\s*</div>\s*<!-- Series & Episode Information -->'
search_grid = re.compile(r'<label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">\s*Select Project Archetype & Execution Pipeline\s*</label>\s*<div className="grid grid-cols-1 lg:grid-cols-3 gap-4">.*?</div>\s*</div>\s*\{\/\* Series \& Episode Information', re.DOTALL)

replacement = """<label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
              Select Project Archetype & Execution Pipeline
            </label>
            
            {/* ANIME ROUTES (DISABLED) */}
            <div className="flex items-center gap-4 mb-4">
               <span className="text-[10px] font-mono tracking-widest font-bold uppercase rounded bg-slate-800 text-slate-500 px-2 py-0.5">
                  Anime Studio (In Development)
               </span>
               <div className="flex gap-2">
                 <div className="opacity-50 grayscale cursor-not-allowed border border-slate-800 bg-slate-900 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2">
                    <Film className="h-3 w-3" /> FULL EPISODE
                 </div>
                 <div className="opacity-50 grayscale cursor-not-allowed border border-slate-800 bg-slate-900 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2">
                    <Zap className="h-3 w-3" /> SHORT FORM
                 </div>
               </div>
            </div>

            {/* MANGA ROUTES (ACTIVE) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              
              {/* Single Page Card */}
              <div
                onClick={() => setRoute('MANGA_SINGLE_PAGE')}
                className={`relative p-5 rounded-xl border-2 cursor-pointer transition-all ${
                  route === 'MANGA_SINGLE_PAGE'
                    ? 'border-blue-500 bg-blue-950/30 shadow-lg shadow-blue-500/10'
                    : 'border-slate-800 bg-slate-950/40 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-blue-500/20 text-blue-300">
                      <Film className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-100 text-sm">Single Page Blueprint</h3>
                      <span className="text-xs font-mono text-blue-400">Target: 1 Page</span>
                    </div>
                  </div>
                  {route === 'MANGA_SINGLE_PAGE' && (
                    <CheckCircle2 className="h-5 w-5 text-blue-400" />
                  )}
                </div>
                <div className="mt-4 space-y-2 text-xs text-slate-300">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Clock className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                    <span><strong>Workflow:</strong> Hyper-focused manual drafting</span>
                  </div>
                </div>
              </div>

              {/* Chapter Card */}
              <div
                onClick={() => setRoute('MANGA_CHAPTER')}
                className={`relative p-5 rounded-xl border-2 cursor-pointer transition-all ${
                  route === 'MANGA_CHAPTER'
                    ? 'border-amber-500 bg-amber-950/30 shadow-lg shadow-amber-500/10'
                    : 'border-slate-800 bg-slate-950/40 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-amber-500/20 text-amber-300">
                      <Layers className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-100 text-sm">Chapter Workflow</h3>
                      <span className="text-xs font-mono text-amber-400">Target: 20-30 Pages</span>
                    </div>
                  </div>
                  {route === 'MANGA_CHAPTER' && (
                    <CheckCircle2 className="h-5 w-5 text-amber-400" />
                  )}
                </div>
                <div className="mt-4 space-y-2 text-xs text-slate-300">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Clock className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                    <span><strong>Workflow:</strong> Standard sequential pipeline</span>
                  </div>
                </div>
              </div>

              {/* Volume Card */}
              <div
                onClick={() => setRoute('MANGA_VOLUME')}
                className={`relative p-5 rounded-xl border-2 cursor-pointer transition-all ${
                  route === 'MANGA_VOLUME'
                    ? 'border-rose-500 bg-rose-950/30 shadow-lg shadow-rose-500/10'
                    : 'border-slate-800 bg-slate-950/40 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-rose-500/20 text-rose-300">
                      <BookOpen className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-100 text-sm">Full Manga Volume</h3>
                      <span className="text-xs font-mono text-rose-400 font-semibold">Target: 200+ Pages</span>
                    </div>
                  </div>
                  {route === 'MANGA_VOLUME' && (
                    <CheckCircle2 className="h-5 w-5 text-rose-400" />
                  )}
                </div>
                <div className="mt-4 space-y-2 text-xs text-slate-300">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Clock className="h-3.5 w-3.5 text-rose-400 shrink-0" />
                    <span><strong>Workflow:</strong> Multi-chapter state management</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Series & Episode Information"""

code = search_grid.sub(replacement, code)

# Fix launch button text
button_search = r"<span>Launch \{route === 'FULL_EPISODE' \? 'Route A \(Full 20m\)' : route === 'SHORT_FORM' \? 'Route B \(Short\)' : 'Route C \(Manga Studio\)'\} Pipeline</span>"
button_replace = r"<span>Launch {route.replace(/_/g, ' ')} Pipeline</span>"
code = re.sub(button_search, button_replace, code)

with open('src/components/ProjectRouterModal.tsx', 'w') as f:
    f.write(code)

print("Patch applied.")
