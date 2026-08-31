const fs = require('fs');
const code = fs.readFileSync('src/components/MangaStudioTab.tsx', 'utf8');
const search = `    img.save(output_path)\`}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};`;
const replace = `    img.save(output_path)\`}</pre>
            </div>
          </div>
          
          {mangaScope !== 'single_page' && activeWorkflowStep === 4 && (
            <div className="pt-6 pb-2 flex justify-end border-t border-slate-800/60 mt-4 animate-fadeIn">
              <button 
                onClick={handleNextPage}
                className="flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/20 transition-all active:scale-95 text-sm"
              >
                <span>Complete & Continue to Next Page</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};`;
fs.writeFileSync('src/components/MangaStudioTab.tsx', code.replace(search, replace));
