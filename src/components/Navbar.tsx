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
  Cpu
} from 'lucide-react';
import { ProjectRoute, Series, Episode } from '../types';

interface NavbarProps {
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
}

export const Navbar: React.FC<NavbarProps> = ({
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
  onSpawnSequel
}) => {
  const [apiCredits, setApiCredits] = useState<number | null>(null);

  useEffect(() => {
    const fetchCredits = async () => {
      try {
        const res = await fetch('/api/studio/credits');
        const data = await res.json();
        if (data.success && typeof data.credits === 'number') {
          setApiCredits(data.credits);
        }
      } catch (e) {}
    };
    fetchCredits();
    const interval = setInterval(fetchCredits, 15000);
    return () => clearInterval(interval);
  }, []);

  const steps = [
    { id: 'script', num: 1, label: 'Screenplay Parser', sub: 'DeepSeek-R1' },
    { id: 'vault', num: 2, label: 'Design Vault', sub: 'Hunyuan 4K & Turnaround' },
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
                    <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent font-['Cinzel',serif]">
                      AnimeStudio AI
                    </span>
                    <span className="px-1.5 py-0.5 text-[10px] font-semibold tracking-wider uppercase rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 font-mono">
                      v2.5
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono hidden sm:block">
                    Zero-to-Episode AI Animation Platform
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
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  }`}>
                    {activeEpisode.route === 'FULL_EPISODE' ? 'Route A (20m)' : 'Route B (3m)'}
                  </span>
                )}
              </div>
            )}

          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            
            {/* If on home and project exists: Jump to studio button */}
            {currentView === 'home' && activeSeries && (
              <button
                onClick={onNavigateStudio}
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-semibold transition-colors"
              >
                <Tv className="h-3.5 w-3.5 text-rose-400" />
                <span>Resume Pipeline</span>
              </button>
            )}

            {/* Live ApiFrame Credits Pill */}
            <div 
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-950/40 border border-purple-500/30 text-xs font-mono"
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

            {/* Prepaid Wallet Pill with Shariah Guard */}
            <button
              onClick={onOpenTopupModal}
              className="group flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 hover:border-emerald-500/60 transition-all text-xs cursor-pointer"
              title="Shariah-compliant prepaid balance (Debit only, no negative balance)"
            >
              <div className="flex items-center gap-1 text-emerald-400">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span className="font-mono font-bold">${walletBalance.toFixed(2)}</span>
              </div>
              <span className="text-[10px] text-emerald-300/80 group-hover:text-emerald-200 hidden lg:inline">
                Top-up
              </span>
            </button>

            {/* Architecture Schema Button */}
            <button
              onClick={onOpenSchemaModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-medium transition-colors cursor-pointer"
              title="Inspect Neon PostgreSQL Schema & Indexes"
            >
              <Database className="h-3.5 w-3.5 text-sky-400" />
              <span className="hidden sm:inline">Neon SQL</span>
            </button>

            {/* Python FastAPI Blueprint Button */}
            <button
              onClick={onOpenPythonModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-medium transition-colors cursor-pointer"
              title="View Python FastAPI / Celery / Volcano Orchestration Code"
            >
              <Code2 className="h-3.5 w-3.5 text-amber-400" />
              <span className="hidden sm:inline">Python API</span>
            </button>

            {/* New Project Router Button */}
            <button
              onClick={onOpenProjectRouter}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white text-xs font-bold shadow-md shadow-rose-600/30 transition-all active:scale-95 cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>New Project</span>
            </button>
          </div>

        </div>

        {/* In Studio View: Interactive 4-Step Pipeline Wizard Bar */}
        {currentView === 'studio' && (
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
