import os

with open('src/components/MangaStudioTab.tsx', 'r') as f:
    code = f.read()

# Add a button for "Chapter Preview" inside Scope Selector
scope_end = r"""        {mangaScope !== 'single_page' && (
          <div className="flex items-center gap-4 text-[11px] font-mono text-slate-300 bg-slate-900 px-4 py-2 rounded-lg border border-slate-800">
            {mangaScope === 'full_story' && (
              <div className="flex items-center gap-2">
                <span className="text-slate-500">Chapter:</span>
                <span className="font-bold text-rose-400 text-sm">{currentChapter}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <span className="text-slate-500">Page:</span>
              <span className="font-bold text-emerald-400 text-sm">{currentPage}</span>
            </div>
          </div>
        )}"""

new_scope_end = r"""        {mangaScope !== 'single_page' && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-4 text-[11px] font-mono text-slate-300 bg-slate-900 px-4 py-2 rounded-lg border border-slate-800">
              {mangaScope === 'full_story' && (
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">Chapter:</span>
                  <span className="font-bold text-rose-400 text-sm">{currentChapter}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <span className="text-slate-500">Page:</span>
                <span className="font-bold text-emerald-400 text-sm">{currentPage}</span>
              </div>
            </div>
            
            {historyPages.length > 0 && (
              <button 
                onClick={() => setShowChapterPreview(true)}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-lg shadow-indigo-500/20"
              >
                <Layers className="h-4 w-4" />
                <span>Chapter History ({historyPages.length})</span>
              </button>
            )}
          </div>
        )}"""
code = code.replace(scope_end, new_scope_end)

# Add ID to panels so they can be captured, and add the "Save Panel" button.
panel_div = r"""                    <div
                      key={panel.id}
                      onClick={() => setSelectedPanelId(panel.id)}
                      className={`relative overflow-hidden group cursor-pointer border-4 transition-all duration-200 ${
                        panel.layoutClass
                      } ${
                        isSelected 
                          ? 'border-rose-500 ring-4 ring-rose-500/20 shadow-2xl scale-[1.01] z-10' 
                          : 'border-black hover:border-slate-800'
                      }`}
                    >"""

new_panel_div = r"""                    <div
                      key={panel.id}
                      id={`manga-panel-${panel.id}`}
                      onClick={() => setSelectedPanelId(panel.id)}
                      className={`relative overflow-hidden group cursor-pointer border-4 transition-all duration-200 ${
                        panel.layoutClass
                      } ${
                        isSelected 
                          ? 'border-rose-500 ring-4 ring-rose-500/20 shadow-2xl scale-[1.01] z-10' 
                          : 'border-black hover:border-slate-800'
                      }`}
                    >
                      {/* Save Panel Button */}
                      {panel.imageUrl && activeWorkflowStep >= 3 && (
                        <button
                          onClick={(e) => handleSavePanel(panel.id, index, e)}
                          className="absolute top-2 right-2 z-20 bg-black/60 hover:bg-black/90 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
                          title="Save this panel"
                        >
                          <Download className="h-4 w-4 text-emerald-400" />
                        </button>
                      )}"""
code = code.replace(panel_div, new_panel_div)

# Append the modal for Chapter History Preview at the end of the main component return
return_end = r"""    </div>
  );
};"""

modal_code = r"""
      {/* CHAPTER HISTORY MODAL */}
      {showChapterPreview && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 sm:p-8 overflow-hidden backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-6xl h-full flex flex-col shadow-2xl relative overflow-hidden animate-fadeIn">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-900/80 z-10">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-400 border border-indigo-500/30">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white font-['Cinzel',serif]">Chapter Preview</h2>
                  <p className="text-xs text-slate-400">Review your generated manga pages</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button 
                  onClick={handleSaveFullChapter}
                  className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/20 transition-all"
                >
                  <Download className="h-4 w-4" />
                  <span>Download Full Chapter</span>
                </button>
                <button 
                  onClick={() => setShowChapterPreview(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 p-2.5 rounded-xl transition-all"
                >
                  Close
                </button>
              </div>
            </div>

            {/* Modal Content - Pages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-12 bg-slate-950">
              {historyPages.map((hp) => (
                <div key={hp.id} className="flex flex-col items-center">
                  <div className="mb-4 text-center">
                    <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
                      Page {hp.pageNumber}
                    </span>
                  </div>
                  <div className="relative group max-w-3xl w-full border-8 border-slate-900 rounded-xl overflow-hidden shadow-2xl bg-white">
                    {hp.pageImageObj ? (
                      <img src={hp.pageImageObj} alt={`Page ${hp.pageNumber}`} className="w-full h-auto" />
                    ) : (
                      <div className="w-full h-64 flex items-center justify-center bg-slate-900 text-slate-500">
                        Image capture failed for this page.
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};"""

code = code.replace(return_end, modal_code)

with open('src/components/MangaStudioTab.tsx', 'w') as f:
    f.write(code)

print("UI Patch Applied!")
