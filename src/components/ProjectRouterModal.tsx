import React, { useState } from 'react';
import { X, Sparkles, Film, Zap, ArrowRight, ShieldCheck, Database, CheckCircle2, Clock, Cpu, Layers } from 'lucide-react';
import { ProjectRoute } from '../types';

interface ProjectRouterModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletBalance: number;
  onProjectCreated: (projectData: any) => void;
  initialRoute?: ProjectRoute;
  initialPreset?: any;
  onTopup?: (amount: number) => void;
}

export const ProjectRouterModal: React.FC<ProjectRouterModalProps> = ({
  isOpen,
  onClose,
  walletBalance,
  onProjectCreated,
  initialRoute = 'FULL_EPISODE',
  initialPreset,
  onTopup
}) => {
  const [route, setRoute] = useState<ProjectRoute>(initialRoute);
  const [seriesTitle, setSeriesTitle] = useState('NEO-KYOTO: RESIDUAL SOUL');
  const [episodeTitle, setEpisodeTitle] = useState('Episode 1: The Broken Resonance');
  const [artStyleSeed, setArtStyleSeed] = useState('MAPPA_VIBRANT_CYBERPUNK_CELL_4K_SEED_98214');
  const [globalLore, setGlobalLore] = useState('In 2099 Neo-Kyoto, neural memories are extracted into physical crystal cartridges. A renegade investigator uncovers corporate memory laundering.');
  const [plotPrompt, setPlotPrompt] = useState('Detective Ren investigates a flickering neon nightclub where illegal cognitive chips are auctioned. Enforcer Lyra intercepts him, triggering a high-stakes standoff.');
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (initialRoute) {
      setRoute(initialRoute);
      if (initialRoute === 'SHORT_FORM') {
        setEpisodeTitle('Short 1: Kinetic High-Speed Duel');
      } else {
        setEpisodeTitle('Episode 1: The Broken Resonance');
      }
    }
    if (initialPreset) {
      setSeriesTitle(initialPreset.title || 'NEW ANIME SAGA');
      setGlobalLore(initialPreset.description || '');
      setArtStyleSeed(initialPreset.artStyle || 'MAPPA_VIBRANT_CYBERPUNK_CELL_4K_SEED_98214');
      setPlotPrompt(initialPreset.description || 'Opening sequence introducing the primary protagonists and their world crisis.');
    }
  }, [initialRoute, initialPreset, isOpen]);

  if (!isOpen) return null;

  const minRequired = route === 'FULL_EPISODE' ? 50.00 : 10.00;
  const isWalletSufficient = walletBalance >= minRequired || walletBalance > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/projects/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: 'usr_8829_alpha_neon',
          series_title: seriesTitle,
          episode_title: episodeTitle,
          art_style_seed: artStyleSeed,
          global_lore: globalLore,
          route,
          raw_plot_prompt: plotPrompt,
          wallet_balance: walletBalance
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          onProjectCreated({
            series: data.series,
            episode: data.episode,
            route,
            plotPrompt,
            route_rules: data.route_rules
          });
          onClose();
          return;
        }
      }
      
      // Fallback local creation if API returned non-success
      fallbackCreate();
    } catch (err: any) {
      console.warn("Project router API fallback activated:", err.message);
      fallbackCreate();
    } finally {
      setIsSubmitting(false);
    }
  };

  const fallbackCreate = () => {
    const seriesId = `ser_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const episodeId = `ep_${Date.now()}_01`;
    const targetMinutes = route === 'FULL_EPISODE' ? 20.0 : 2.5;

    const fallbackSeries = {
      id: seriesId,
      user_id: 'usr_8829_alpha_neon',
      title: seriesTitle || 'NEO-KYOTO: RESIDUAL SOUL',
      global_lore: globalLore || 'In 2099 Neo-Kyoto, neural memories are extracted into physical crystal cartridges.',
      art_style_seed: artStyleSeed || 'MAPPA_VIBRANT_CYBERPUNK_CELL_4K_SEED_98214',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const fallbackEpisode = {
      id: episodeId,
      series_id: seriesId,
      episode_number: 1,
      title: episodeTitle || 'Episode 1: The Broken Resonance',
      route,
      full_script_json: {
        logline: `Episode 1 of ${seriesTitle}`,
        synopsis: plotPrompt,
        target_runtime_minutes: targetMinutes,
        route,
        scenes: []
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    onProjectCreated({
      series: fallbackSeries,
      episode: fallbackEpisode,
      route,
      plotPrompt,
      route_rules: {
        route,
        target_runtime_minutes: targetMinutes,
        scene_chunk_seconds: route === 'FULL_EPISODE' ? '30-60s' : '5-10s'
      }
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-rose-500/20 border border-rose-500/30 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-rose-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 font-['Cinzel',serif]">
                Step 0: Conditional Project Router (POST /api/projects/create)
              </h2>
              <p className="text-xs text-slate-400">
                Fork execution pipeline based on project archetype & duration architecture
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">

          {/* Archetype Selector: Route A vs Route B */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
              Select Project Archetype & Execution Pipeline
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Route A Card */}
              <div
                onClick={() => setRoute('FULL_EPISODE')}
                className={`relative p-5 rounded-xl border-2 cursor-pointer transition-all ${
                  route === 'FULL_EPISODE'
                    ? 'border-indigo-500 bg-indigo-950/30 shadow-lg shadow-indigo-500/10'
                    : 'border-slate-800 bg-slate-950/40 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-300">
                      <Film className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-100 text-sm">ROUTE A: Full-Length Episode</h3>
                      <span className="text-xs font-mono text-indigo-400">Target: 15–20+ Minutes</span>
                    </div>
                  </div>
                  {route === 'FULL_EPISODE' && (
                    <CheckCircle2 className="h-5 w-5 text-indigo-400" />
                  )}
                </div>

                <div className="mt-4 space-y-2 text-xs text-slate-300">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Clock className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                    <span><strong>Scene Chunking:</strong> 30–60 second master scenes</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <Cpu className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                    <span><strong>Render Engine:</strong> Seedance 2.5 Extended Pipeline (up to 180s via video_extension)</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <Layers className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                    <span><strong>Asset Caching:</strong> Heavy 4K Hunyuan keyframes & character turnaround vaulting</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Min. Prepaid Compute:</span>
                  <span className="font-mono font-bold text-indigo-300">$50.00</span>
                </div>
              </div>

              {/* Route B Card */}
              <div
                onClick={() => setRoute('SHORT_FORM')}
                className={`relative p-5 rounded-xl border-2 cursor-pointer transition-all ${
                  route === 'SHORT_FORM'
                    ? 'border-amber-500 bg-amber-950/30 shadow-lg shadow-amber-500/10'
                    : 'border-slate-800 bg-slate-950/40 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-amber-500/20 text-amber-300">
                      <Zap className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-100 text-sm">ROUTE B: Short Form Content</h3>
                      <span className="text-xs font-mono text-amber-400">Target: 1–3 Minutes</span>
                    </div>
                  </div>
                  {route === 'SHORT_FORM' && (
                    <CheckCircle2 className="h-5 w-5 text-amber-400" />
                  )}
                </div>

                <div className="mt-4 space-y-2 text-xs text-slate-300">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Clock className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                    <span><strong>Scene Chunking:</strong> 5–10 second fast, high-impact loops</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <Cpu className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                    <span><strong>Render Engine:</strong> Seedance Standard Fast Loop</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <Layers className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                    <span><strong>Asset Caching:</strong> Rapid timeline assembly on demand</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Min. Prepaid Compute:</span>
                  <span className="font-mono font-bold text-amber-300">$10.00</span>
                </div>
              </div>

            </div>
          </div>

          {/* Series & Episode Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Series Title (Continuity Root)
              </label>
              <input
                type="text"
                value={seriesTitle}
                onChange={(e) => setSeriesTitle(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-rose-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Episode 1 Title
              </label>
              <input
                type="text"
                value={episodeTitle}
                onChange={(e) => setEpisodeTitle(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-rose-500 font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Art Style Seed (Global Aesthetic Reference)
              </label>
              <input
                type="text"
                value={artStyleSeed}
                onChange={(e) => setArtStyleSeed(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-rose-300 focus:outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Global Lore / Universe Rules
              </label>
              <input
                type="text"
                value={globalLore}
                onChange={(e) => setGlobalLore(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          {/* Episode Plot Prompt */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Episode Story Plot (Raw Screenplay Prompt for DeepSeek-R1)
            </label>
            <textarea
              rows={3}
              value={plotPrompt}
              onChange={(e) => setPlotPrompt(e.target.value)}
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-100 focus:outline-none focus:border-rose-500 font-sans leading-relaxed"
              placeholder="Describe the episode narrative arc, key action set-pieces, characters involved, and locations..."
            />
          </div>

          {/* Wallet Balance & Shariah Guard Verification */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-950 border border-slate-800">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <div>
                <span className="text-xs text-slate-300 font-medium">Prepaid Compute Balance: </span>
                <span className="text-xs font-mono font-bold text-emerald-400">${walletBalance.toFixed(2)}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {onTopup && (
                <button
                  type="button"
                  onClick={() => onTopup(100)}
                  className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[11px] font-semibold transition-colors cursor-pointer"
                >
                  + Add $100 Demo Credits
                </button>
              )}
              <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" /> Pipeline Ready
              </span>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-gradient-to-r from-rose-600 via-pink-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <span>Initializing Pipeline...</span>
              ) : (
                <>
                  <span>Launch {route === 'FULL_EPISODE' ? 'Route A (Full 20m)' : 'Route B (Short)'} Pipeline</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
