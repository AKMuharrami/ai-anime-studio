import React, { useState, useEffect } from 'react';
import { 
  Clapperboard, 
  Sparkles, 
  Wallet, 
  Database, 
  Code2, 
  Plus, 
  Layers, 
  Film, 
  ChevronRight,
  ShieldCheck,
  Zap,
  RefreshCw,
  Home,
  ArrowLeft,
  Tv,
  CheckCircle2,
  Cpu,
  Menu,
  X
} from 'lucide-react';
import { ProjectRoute, Series, Episode, User } from '../types';

interface NavbarProps {
  user: User | null;
  currentView: 'home' | 'studio';
  onNavigateHome: () => void;
  onNavigateStudio: () => void;
  seriesList: Series[];
  activeSeries: Series | null;
  onSelectSeries: (series: Series) => void;
  episodes: Episode[];
  activeEpisode: Episode | null;
  onSelectEpisode: (episode: Episode) => void;
  walletBalance: number;
  onOpenTopupModal: () => void;
  onOpenProjectRouter: () => void;
  onOpenSchemaModal: () => void;
  onOpenPythonModal: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onSpawnSequel: () => void;
  token: string | null;
  onOpenAuth: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  currentView,
  onNavigateHome,
  onNavigateStudio,
  seriesList,
  activeSeries,
  onSelectSeries,
  episodes,
  activeEpisode,
  onSelectEpisode,
  walletBalance,
  onOpenTopupModal,
  onOpenProjectRouter,
  onOpenSchemaModal,
  onOpenPythonModal,
  activeTab,
  setActiveTab,
  onSpawnSequel,
  token,
  onOpenAuth
}) => {
  const [apiCredits, setApiCredits] = useState<number | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const fetchCredits = async () => {
      if (!token) {
        setApiCredits(0);
        return;
      }
      try {
        const res = await fetch('/api/studio/credits', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await res.json();
        if (data.success && typeof data.credits === 'number') {
          setApiCredits(data.credits);
        }
      } catch (e) {}
    };
    fetchCredits();
    const interval = setInterval(fetchCredits, 15000);
    return () => clearInterval(interval);
  }, [token]);

  const steps = activeEpisode?.route === 'MANGA_STUDIO' ? [
    { id: 'manga', num: 'C', label: 'AI Manga Studio', sub: 'Qwen-Image-Edit & Pillow Pipeline' }
  ] : [
    { id: 'script', num: 1, label: 'Screenplay Parser', sub: 'DeepSeek-R1' },
    { id: 'vault', num: 2, label: 'Design Vault', sub: 'Qwen 4K & Turnaround' },
    { id: 'seedance', num: 3, label: 'Seedance Studio', sub: '5-Lane Multimodal' },
    { id: 'sound', num: 4, label: 'Sound & Voice Studio', sub: 'Fish Audio & Foley (Halal)' },
    { id: 'timeline', num: 5, label: 'Timeline & Master', sub: 'FFmpeg & Subtitles' }
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-slate-800/90 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Bar */}
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Left: Studio Brand / Back to Home */}
          <div className="flex items-center gap-3">
            
            {currentView === 'studio' ? (
              <button
                onClick={onNavigateHome}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-semibold transition-all group shadow-sm cursor-pointer"
                title="Return to Studio Homepage"
              >
                <ArrowLeft className="h-4 w-4 text-rose-400 group-hover:-translate-x-0.5 transition-transform" />
                <span>Studio Hub</span>
              </button>
            ) : (
              <div 
                onClick={onNavigateHome}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-rose-500 via-purple-600 to-indigo-600 p-0.5 shadow-lg shadow-rose-500/20 group-hover:scale-105 transition-transform">
                  <div className="h-full w-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                    <Clapperboard className="h-5 w-5 text-rose-400" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600 bg-clip-text text-transparent font-['Cinzel',serif]">
                      AI Manga Studio
                    </span>
                    <span className="px-1.5 py-0.5 text-[10px] font-semibold tracking-wider uppercase rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 font-mono">
                      v2.5
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono hidden sm:block">
                    Zero-to-Chapter AI Manga Platform
                  </p>
                </div>
              </div>
            )}

            {/* In Studio View: Current Active Project Badge */}
            {currentView === 'studio' && activeSeries && (
              <div className="hidden sm:flex items-center gap-2 bg-slate-900/90 border border-slate-800 rounded-xl px-3 py-1.5 text-xs">
                <select
                  value={activeSeries.id}
                  onChange={(e) => {
                    const s = seriesList.find(item => item.id === e.target.value);
                    if (s) onSelectSeries(s);
                  }}
                  className="bg-transparent text-slate-200 font-semibold focus:outline-none cursor-pointer"
                >
                  {seriesList.map((s) => (
                    <option key={s.id} value={s.id} className="bg-slate-900 text-slate-100">
                      📺 {s.title}
                    </option>
                  ))}
                </select>

                <span className="text-slate-600">/</span>

                <select
                  value={activeEpisode?.id || ''}
                  onChange={(e) => {
                    const ep = episodes.find(item => item.id === e.target.value);
                    if (ep) onSelectEpisode(ep);
                  }}
                  className="bg-transparent text-rose-300 font-semibold focus:outline-none cursor-pointer"
                >
                  {episodes.map((ep) => (
                    <option key={ep.id} value={ep.id} className="bg-slate-900 text-slate-100">
                      Ep {ep.episode_number}: {ep.title}
                    </option>
                  ))}
                </select>

                {activeEpisode && (
                  <span className={`ml-1 px-2 py-0.5 text-[10px] font-semibold rounded-md uppercase tracking-wider font-mono ${
                    activeEpisode.route === 'FULL_EPISODE' 
                      ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                      : activeEpisode.route === 'SHORT_FORM'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  }`}>
                    {activeEpisode.route === 'FULL_EPISODE' ? 'Route A (20m)' : activeEpisode.route === 'SHORT_FORM' ? 'Route B (3m)' : 'Route C (Manga)'}
                  </span>
                )}
              </div>
            )}

          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            
            {/* If on home and project exists: Jump to studio button */}
            {token && currentView === 'home' && activeSeries && (
              <button
                onClick={onNavigateStudio}
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-semibold transition-colors"
              >
                <Tv className="h-3.5 w-3.5 text-rose-400" />
                <span>Resume Pipeline</span>
              </button>
            )}

            {!token ? (
              <button
                onClick={onOpenAuth}
                className="px-3.5 sm:px-5 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-white font-bold text-[11px] sm:text-xs transition-all shadow-md shadow-amber-500/15 cursor-pointer flex items-center gap-1.5 hover:scale-[1.02]"
              >
                <Sparkles className="h-3.5 w-3.5 text-amber-200" />
                <span>Sign In / Register</span>
              </button>
            ) : (
              <>
                {/* Live ApiFrame Credits Pill (hidden on sm, handled in mobile drawer) */}
                <div 
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-950/40 border border-purple-500/30 text-xs font-mono"
                  title="Live ApiFrame Qwen 2 Pro Generation Credits (Synced in real-time)"
                >
                  <Cpu className="h-3.5 w-3.5 text-purple-400" />
                  <span className="text-purple-300 font-bold">
                    {apiCredits !== null ? `${apiCredits} Cr` : 'Syncing...'}
                  </span>
                  <span className="text-[10px] text-purple-400/70 hidden xl:inline">
                    (Qwen Pro)
                  </span>
                </div>

                {/* Prepaid Wallet Pill (hidden on sm, handled in mobile drawer) */}
                <button
                  onClick={onOpenTopupModal}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 hover:text-emerald-300 font-bold border border-emerald-500/20 text-xs transition-colors shadow-sm shadow-emerald-500/10"
                >
                  <Plus className="h-3 w-3" />
                  <span>TOP-UP</span>
                </button>
                
                {/* Sign Out (hidden on sm, handled in mobile drawer) */}
                <button
                  onClick={() => {
                    localStorage.removeItem('ais_token');
                    window.location.reload();
                  }}
                  className="hidden sm:flex items-center px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white font-bold border border-slate-700 text-xs transition-colors shadow-sm"
                >
                  Sign Out
                </button>

                {/* Burger Menu Button (Visible on Mobile only) */}
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-900 border border-slate-800/50 hover:border-slate-800 transition-all sm:hidden cursor-pointer flex items-center justify-center bg-slate-900/50"
                  title="Toggle Mobile Menu"
                >
                  {isMobileMenuOpen ? <X className="h-4 w-4 text-rose-400" /> : <Menu className="h-4 w-4" />}
                </button>
              </>
            )}
          </div>

        </div>

        {/* Mobile Menu Panel Expansion */}
        {isMobileMenuOpen && token && (
          <div className="sm:hidden border-t border-slate-800/80 bg-slate-950 px-4 py-5 space-y-4 animate-slideDown shadow-xl max-h-[85vh] overflow-y-auto">
            {/* Live ApiFrame Credits */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-purple-950/25 border border-purple-500/20 text-xs font-mono">
              <div className="flex items-center gap-2">
                <Cpu className="h-4 w-4 text-purple-400" />
                <span className="text-slate-300">Qwen Pro Credits:</span>
              </div>
              <span className="text-purple-300 font-bold">
                {apiCredits !== null ? `${apiCredits} Cr` : 'Syncing...'}
              </span>
            </div>

            {/* In Studio View: Project Switchers for Mobile */}
            {currentView === 'studio' && activeSeries && (
              <div className="space-y-3 p-3 bg-slate-900/60 border border-slate-800 rounded-xl">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-slate-500 font-bold block">Active Series</label>
                  <select
                    value={activeSeries.id}
                    onChange={(e) => {
                      const s = seriesList.find(item => item.id === e.target.value);
                      if (s) {
                        onSelectSeries(s);
                        setIsMobileMenuOpen(false);
                      }
                    }}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs font-semibold rounded-lg px-2.5 py-2 outline-none cursor-pointer"
                  >
                    {seriesList.map((s) => (
                      <option key={s.id} value={s.id} className="bg-slate-900 text-slate-100">
                        📺 {s.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-slate-500 font-bold block">Active Episode</label>
                  <select
                    value={activeEpisode?.id || ''}
                    onChange={(e) => {
                      const ep = episodes.find(item => item.id === e.target.value);
                      if (ep) {
                        onSelectEpisode(ep);
                        setIsMobileMenuOpen(false);
                      }
                    }}
                    className="w-full bg-slate-950 border border-slate-800 text-rose-300 text-xs font-semibold rounded-lg px-2.5 py-2 outline-none cursor-pointer"
                  >
                    {episodes.map((ep) => (
                      <option key={ep.id} value={ep.id} className="bg-slate-900 text-slate-100">
                        Ep {ep.episode_number}: {ep.title}
                      </option>
                    ))}
                  </select>
                </div>

                {activeEpisode && (
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-[10px] text-slate-400 font-mono">Format:</span>
                    <span className={`px-2 py-0.5 text-[9px] font-semibold rounded uppercase tracking-wider font-mono ${
                      activeEpisode.route === 'FULL_EPISODE' 
                        ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                        : activeEpisode.route === 'SHORT_FORM'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    }`}>
                      {activeEpisode.route === 'FULL_EPISODE' ? 'Route A (20m)' : activeEpisode.route === 'SHORT_FORM' ? 'Route B (3m)' : 'Route C (Manga)'}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Quick Action Commands (Admin Only) */}
            {user?.is_admin && (
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  onClick={() => {
                    onOpenSchemaModal();
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center justify-center gap-1.5 p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-300 hover:text-white"
                >
                  <Database className="h-3.5 w-3.5 text-sky-400" />
                  <span>DB Schema</span>
                </button>
                <button
                  onClick={() => {
                    onOpenPythonModal();
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center justify-center gap-1.5 p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-300 hover:text-white"
                >
                  <Code2 className="h-3.5 w-3.5 text-amber-400" />
                  <span>Celery Workers</span>
                </button>
              </div>
            )}

            {/* Resume button if on homepage */}
            {currentView === 'home' && activeSeries && (
              <button
                onClick={() => {
                  onNavigateStudio();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-semibold transition-all"
              >
                <Tv className="h-4 w-4 text-rose-400" />
                <span>Resume Pipeline Studio</span>
              </button>
            )}

            {/* Footer level actions: Top-Up and Logout */}
            <div className="flex items-center gap-2.5 pt-2 border-t border-slate-800">
              <button
                onClick={() => {
                  onOpenTopupModal();
                  setIsMobileMenuOpen(false);
                }}
                className="flex-1 py-2.5 rounded-xl bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 font-bold border border-emerald-500/30 text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm shadow-emerald-500/5"
              >
                <Plus className="h-3.5 w-3.5" />
                TOP-UP BALANCES
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem('ais_token');
                  window.location.reload();
                }}
                className="py-2.5 px-4 rounded-xl bg-slate-900 text-slate-400 hover:text-white font-bold border border-slate-800 text-xs transition-all"
              >
                Sign Out
              </button>
            </div>

          </div>
        )}

        {/* In Studio View: Interactive 4-Step Pipeline Wizard Bar */}
        {currentView === 'studio' && !activeEpisode?.route?.startsWith('MANGA_') && (
          <div className="flex items-center justify-between border-t border-slate-800/80 pt-2 pb-2.5 overflow-x-auto no-scrollbar gap-2">
            
            <div className="flex items-center space-x-1 sm:space-x-2">
              {steps.map((s, idx) => {
                const isActive = activeTab === s.id;
                return (
                  <React.Fragment key={s.id}>
                    {idx > 0 && <ChevronRight className="h-3.5 w-3.5 text-slate-700 shrink-0" />}
                    
                    <button
                      onClick={() => setActiveTab(s.id)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                        isActive
                          ? s.id === 'script'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm shadow-rose-500/10'
                            : s.id === 'vault'
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm shadow-purple-500/10'
                            : s.id === 'seedance'
                            ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm shadow-sky-500/10'
                            : s.id === 'sound'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm shadow-amber-500/10'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm shadow-emerald-500/10'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80 border border-transparent'
                      }`}
                    >
                      <span className={`h-4 w-4 rounded text-[10px] flex items-center justify-center font-bold font-mono ${
                        isActive
                          ? s.id === 'script'
                            ? 'bg-rose-500 text-slate-950'
                            : s.id === 'vault'
                            ? 'bg-purple-500 text-slate-950'
                            : s.id === 'seedance'
                            ? 'bg-sky-500 text-slate-950'
                            : s.id === 'sound'
                            ? 'bg-amber-500 text-slate-950'
                            : 'bg-emerald-500 text-slate-950'
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {s.num}
                      </span>
                      <div className="text-left">
                        <span className="block leading-none">{s.label}</span>
                        <span className="text-[9px] text-slate-500 font-mono hidden md:block mt-0.5">{s.sub}</span>
                      </div>
                    </button>
                  </React.Fragment>
                );
              })}
            </div>

            {/* Right: Quick Sequel Spawn button */}
            <div className="shrink-0 pl-2">
              <button
                onClick={onSpawnSequel}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-indigo-950/70 text-indigo-300 hover:text-indigo-200 border border-indigo-500/30 text-xs font-semibold transition-all cursor-pointer"
                title="Spawn follow-up sequel episode preserving character and environment vaults"
              >
                <RefreshCw className="h-3.5 w-3.5 text-indigo-400" />
                <span className="hidden sm:inline">Spawn Ep {episodes.length + 1}</span>
                <span className="sm:hidden">Ep {episodes.length + 1}</span>
              </button>
            </div>

          </div>
        )}

      </div>
    </header>
  );
};
