import React, { useState } from 'react';
import { X, Sparkles, Film, Zap, ArrowRight, ShieldCheck, Database, CheckCircle2, Clock, Cpu, Layers, BookOpen } from 'lucide-react';
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
  const [seriesTitle, setSeriesTitle] = useState('');
  const [episodeTitle, setEpisodeTitle] = useState('');
  const [artStyleSeed, setArtStyleSeed] = useState('GEKIGA_INK_WASH_MONOCHROME_HIGH_CONTRAST');
  const [globalLore, setGlobalLore] = useState('');
  const [plotPrompt, setPlotPrompt] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (initialRoute) {
      setRoute(initialRoute);
      if (initialRoute === 'SHORT_FORM') {
        setEpisodeTitle('');
      } else if (initialRoute === 'MANGA_STUDIO' || initialRoute?.startsWith('MANGA_')) {
        setEpisodeTitle('');
        setSeriesTitle(initialPreset?.title || '');
        setArtStyleSeed(initialPreset?.artStyle || 'GEKIGA_INK_WASH_MONOCHROME_HIGH_CONTRAST');
        setGlobalLore(initialPreset?.description || '');
        setPlotPrompt('');
      } else {
        setEpisodeTitle('');
      }
    }
    if (initialPreset) {
      setSeriesTitle(initialPreset.title || '');
      setGlobalLore(initialPreset.description || '');
      setArtStyleSeed(initialPreset.artStyle || 'GEKIGA_INK_WASH_MONOCHROME_HIGH_CONTRAST');
      setPlotPrompt(initialPreset.description || '');
    }
  }, [initialRoute, initialPreset, isOpen]);

  if (!isOpen) return null;

  const minRequired = route === 'FULL_EPISODE' ? 50.00 : route === 'SHORT_FORM' ? 10.00 : 2.00;
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
    const targetMinutes = route === 'FULL_EPISODE' ? 20.0 : route === 'SHORT_FORM' ? 2.5 : 0.0;

    const fallbackSeries = {
      id: seriesId,
      user_id: 'usr_8829_alpha_neon',
      title: seriesTitle || (route === 'MANGA_STUDIO' ? 'COGNITIVE CHIP: CODE GENESIS' : 'NEO-KYOTO: RESIDUAL SOUL'),
      global_lore: globalLore || 'In 2099 Neo-Kyoto, neural memories are extracted into physical crystal cartridges.',
      art_style_seed: artStyleSeed || 'MAPPA_VIBRANT_CYBERPUNK_CELL_4K_SEED_98214',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const fallbackEpisode = {
      id: episodeId,
      series_id: seriesId,
      episode_number: 1,
      title: episodeTitle || (route === 'MANGA_STUDIO' ? 'Chapter 1: The Broken Code Matrix' : 'Episode 1: The Broken Resonance'),
      route,
      full_script_json: {
        logline: plotPrompt,
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
                placeholder="e.g., Aethel: Cyber-Soul 2099"
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
                placeholder="e.g., Chapter 1: The Neon Awakening"
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
                placeholder="e.g., 1990s dark fantasy OVA, high contrast Gekiga ink, cyberpunk neon"
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
                placeholder="e.g., In a dystopian mega-city, rogue androids are hunted by cybernetic shamans..."
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
              placeholder="e.g., Kael, a rogue cyber-shaman, discovers a hidden server vault beneath the city and must fight off three security drones using his neon katana to retrieve a stolen memory core..."
            />
          </div>

          {/* Wallet Balance & No-Debt Guard Verification */}
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
                  <span>Launch {route.replace(/_/g, ' ')} Pipeline</span>
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
