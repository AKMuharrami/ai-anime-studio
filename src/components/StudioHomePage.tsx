import React, { useState } from 'react';
import { 
  Film, 
  Zap, 
  Sparkles, 
  ArrowRight, 
  Layers, 
  Database, 
  Code2, 
  ShieldCheck, 
  Play, 
  Clapperboard, 
  Clock, 
  Users, 
  MapPin, 
  ChevronRight, 
  Palette, 
  Radio, 
  Cpu, 
  Volume2, 
  FolderPlus,
  RefreshCw,
  Award,
  Video
} from 'lucide-react';
import { ProjectRoute, Series, Episode, Character, Environment } from '../types';

interface StudioHomePageProps {
  seriesList: Series[];
  episodes: Episode[];
  characters: Character[];
  environments: Environments[];
  walletBalance: number;
  onSelectRouteAndCreate: (route: ProjectRoute, preset?: any) => void;
  onResumeProject: (series: Series, episode: Episode, step?: string) => void;
  onOpenTopupModal: () => void;
  onOpenSchemaModal: () => void;
  onOpenPythonModal: () => void;
  onSpawnSequel: (series: Series) => void;
}

type Environments = Environment;

export const StudioHomePage: React.FC<StudioHomePageProps> = ({
  seriesList,
  episodes,
  characters,
  environments,
  walletBalance,
  onSelectRouteAndCreate,
  onResumeProject,
  onOpenTopupModal,
  onOpenSchemaModal,
  onOpenPythonModal,
  onSpawnSequel
}) => {
  const [activePresetCategory, setActivePresetCategory] = useState<'all' | 'cyberpunk' | 'fantasy' | 'action'>('all');

  const popularPresets = [
    {
      id: 'pre_cyber_2099',
      category: 'cyberpunk',
      title: 'NEO-KYOTO: RESIDUAL SOUL',
      genre: 'Cyberpunk Noir & Neural Espionage',
      route: 'FULL_EPISODE' as ProjectRoute,
      runtime: '20.0 min (30-60s scenes)',
      tag: 'Route A • Extended Pipeline',
      artStyle: 'MAPPA_VIBRANT_CYBERPUNK_4K',
      description: 'In 2099 Neo-Kyoto, neural memories are extracted into physical crystal cartridges. A renegade detective uncovers corporate soul trafficking.',
      color: 'from-rose-500/20 to-purple-600/20 border-rose-500/30 text-rose-300'
    },
    {
      id: 'pre_shonen_climax',
      category: 'action',
      title: 'VALKYRIE BLADE: ECLIPSE REEL',
      genre: 'Sakuga Martial Arts & Energy Clash',
      route: 'SHORT_FORM' as ProjectRoute,
      runtime: '2.5 min (5-10s rapid cuts)',
      tag: 'Route B • Viral Reel',
      artStyle: 'UFOTABLE_UNLIMITED_BLADE_4K',
      description: 'High-speed duel between twin celestial blademasters across collapsing obsidian pillars with dynamic 3D camera sweeps and particle sparks.',
      color: 'from-amber-500/20 to-orange-600/20 border-amber-500/30 text-amber-300'
    },
    {
      id: 'pre_dark_fantasy',
      category: 'fantasy',
      title: 'ASTRAL GATE: THE FORGOTTEN KINGDOM',
      genre: 'High Dark Fantasy & Ancient Runes',
      route: 'FULL_EPISODE' as ProjectRoute,
      runtime: '18.5 min (30-60s scenes)',
      tag: 'Route A • Extended Pipeline',
      artStyle: 'WIT_STUDIO_DARK_FANTASY_4K',
      description: 'An exiled alchemist journeys through crystalline ruins to restore a fractured leyline before the celestial eclipse tears reality.',
      color: 'from-sky-500/20 to-indigo-600/20 border-sky-500/30 text-sky-300'
    }
  ];

  const filteredPresets = activePresetCategory === 'all' 
    ? popularPresets 
    : popularPresets.filter(p => p.category === activePresetCategory);

  return (
    <div className="space-y-12 pb-16 animate-fadeIn">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800/80 p-8 sm:p-12 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-96 h-96 bg-gradient-to-br from-rose-500/10 via-purple-600/10 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-96 h-96 bg-gradient-to-tr from-sky-500/10 via-indigo-600/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
          
          {/* Top Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800/90 border border-slate-700/80 text-xs text-slate-300 font-mono shadow-inner">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Volcano Engine Seedance 2.5 • Hunyuan 4K • DeepSeek-R1 • Fish Speech</span>
          </div>

          {/* Master Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white font-['Cinzel',serif] leading-tight">
            Create Full Anime Series & Kinetic Shorts
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto font-sans leading-relaxed">
            Enterprise zero-to-episode animation studio. Turn a single prompt into screenplay breakdowns, persistent 4K character Soul ID vaults, and fully compiled master videos with multi-track lip sync and sequel continuity.
          </p>

          {/* Quick Engine Status Bar */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2 text-xs font-mono text-slate-400">
            <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-950/50 text-emerald-300 rounded-lg border border-emerald-500/40">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span>Shariah AI Guardrails Active</span>
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1 bg-slate-950/60 rounded-lg border border-slate-800">
              <Cpu className="h-3.5 w-3.5 text-rose-400" />
              <span>Seedance 2.5 (180s Extension)</span>
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1 bg-slate-950/60 rounded-lg border border-slate-800">
              <Palette className="h-3.5 w-3.5 text-purple-400" />
              <span>Hunyuan 4K Modest Layouts</span>
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1 bg-slate-950/60 rounded-lg border border-slate-800">
              <Volume2 className="h-3.5 w-3.5 text-emerald-400" />
              <span>Instrument-Free Foley & Speech</span>
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1 bg-slate-950/60 rounded-lg border border-slate-800">
              <Database className="h-3.5 w-3.5 text-sky-400" />
              <span>Neon PostgreSQL</span>
            </span>
          </div>

        </div>
      </section>

      {/* Primary Creation Choices: Route A vs Route B */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-rose-400 font-semibold block">
              Step 0: Choose Production Format
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white font-['Cinzel',serif] tracking-tight">
              Select Your Project Format
            </h2>
          </div>
          <p className="text-xs text-slate-400 max-w-md">
            The studio pipeline adapts chunk durations, video extension rates, and vault caching according to your chosen format.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Choice 1: Route A - Full Episode */}
          <div 
            onClick={() => onSelectRouteAndCreate('FULL_EPISODE')}
            className="group relative bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950 border-2 border-indigo-500/40 hover:border-indigo-400 rounded-3xl p-8 cursor-pointer transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/20 hover:-translate-y-1 flex flex-col justify-between"
          >
            <div className="absolute top-6 right-6">
              <span className="px-3 py-1 text-xs font-mono font-bold rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                Route A (Long-Form)
              </span>
            </div>

            <div className="space-y-5">
              <div className="h-14 w-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Film className="h-7 w-7 text-indigo-400" />
              </div>

              <div>
                <h3 className="text-2xl font-black text-white font-['Cinzel',serif] group-hover:text-indigo-300 transition-colors">
                  Full-Length Anime Episode
                </h3>
                <p className="text-sm font-mono text-indigo-400 font-semibold mt-1">
                  15 – 20+ Minutes • Deep Continuous Narrative
                </p>
              </div>

              <p className="text-sm text-slate-300 leading-relaxed">
                Full-scale broadcast anime workflow. Generates structured 30–60s continuous master scenes, unlocks Seedance 2.5 extended rendering (up to 180s per scene), multi-character turnaround vaults, and episodic sequel continuity.
              </p>

              {/* Feature Checklist */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 text-xs text-slate-300 font-mono">
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
                  <span>30–60s Master Scene Chunks</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
                  <span>Seedance 180s Video Extension</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
                  <span>4K Character Soul ID Vault</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
                  <span>Multi-Track Dialogue & OST</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
                  <span>Hunyuan 4K Layout Keyframing</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
                  <span>Sequel Hub (Spawn Ep 2+)</span>
                </div>
              </div>
            </div>

            <div className="pt-8 flex items-center justify-between border-t border-slate-800/80 mt-6">
              <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                <span>Est. Credits:</span>
                <span className="font-bold text-emerald-400">$50.00 Prepaid</span>
              </div>

              <div className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 group-hover:gap-3 transition-all">
                <span>Start Full Episode</span>
                <ArrowRight className="h-4 w-4" />
              </div>
            </div>
          </div>

          {/* Choice 2: Route B - Viral Anime Short */}
          <div 
            onClick={() => onSelectRouteAndCreate('SHORT_FORM')}
            className="group relative bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950 border-2 border-amber-500/40 hover:border-amber-400 rounded-3xl p-8 cursor-pointer transition-all duration-300 hover:shadow-2xl hover:shadow-amber-500/20 hover:-translate-y-1 flex flex-col justify-between"
          >
            <div className="absolute top-6 right-6">
              <span className="px-3 py-1 text-xs font-mono font-bold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                Route B (Short-Form)
              </span>
            </div>

            <div className="space-y-5">
              <div className="h-14 w-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Zap className="h-7 w-7 text-amber-400" />
              </div>

              <div>
                <h3 className="text-2xl font-black text-white font-['Cinzel',serif] group-hover:text-amber-300 transition-colors">
                  Viral Anime Short / Reel
                </h3>
                <p className="text-sm font-mono text-amber-400 font-semibold mt-1">
                  1 – 3 Minutes • High-Kinetic Sakuga Action
                </p>
              </div>

              <p className="text-sm text-slate-300 leading-relaxed">
                Fast-paced kinetic short format optimized for YouTube Shorts, Reels, and TikTok. Generates 5–10s rapid cuts, dynamic camera sweeps, punchy sakuga choreography, and instant viral pacing.
              </p>

              {/* Feature Checklist */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 text-xs text-slate-300 font-mono">
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                  <span>5–10s Rapid Kinetic Cuts</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                  <span>Vertical & Cinematic Pacing</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                  <span>Rapid Turnaround Matching</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                  <span>High-Impact Climax Scoring</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                  <span>Instant Audio-Visual Lip Track</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                  <span>10x Faster Batch Render</span>
                </div>
              </div>
            </div>

            <div className="pt-8 flex items-center justify-between border-t border-slate-800/80 mt-6">
              <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                <span>Est. Credits:</span>
                <span className="font-bold text-emerald-400">$10.00 Prepaid</span>
              </div>

              <div className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-lg shadow-amber-600/30 group-hover:gap-3 transition-all">
                <span>Start Anime Short</span>
                <ArrowRight className="h-4 w-4" />
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Active Series & Episodic Productions */}
      {seriesList.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-purple-400 font-semibold block">
                Production Library
              </span>
              <h2 className="text-2xl font-bold text-white font-['Cinzel',serif]">
                Continue Active Series & Episodes
              </h2>
            </div>
            <span className="text-xs font-mono text-slate-400">
              {seriesList.length} Active Series • {episodes.length} Episodes
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {seriesList.map((series) => {
              const seriesEps = episodes.filter(e => e.series_id === series.id);
              const seriesChars = characters.filter(c => c.series_id === series.id);
              const seriesEnvs = environments.filter(e => e.series_id === series.id);
              const latestEp = seriesEps[seriesEps.length - 1] || seriesEps[0];

              return (
                <div 
                  key={series.id}
                  className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-6 space-y-4 transition-all duration-200 hover:shadow-xl flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-wider text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                          {series.art_style_seed.split('_')[0]} Animation
                        </span>
                        <h3 className="font-bold text-lg text-white font-['Cinzel',serif] mt-1">
                          {series.title}
                        </h3>
                      </div>
                      <span className="px-2 py-1 text-[11px] font-mono rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {seriesEps.length} Ep{seriesEps.length > 1 ? 's' : ''}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 line-clamp-2">
                      {series.global_lore}
                    </p>

                    {/* Roster & Vault Badges */}
                    <div className="flex items-center gap-3 pt-1 text-xs font-mono text-slate-400">
                      <span className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5 text-purple-400" />
                        <span>{seriesChars.length} Soul IDs</span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-sky-400" />
                        <span>{seriesEnvs.length} 4K Layouts</span>
                      </span>
                    </div>

                    {/* Latest Episode Pill */}
                    {latestEp && (
                      <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-slate-200">
                            Ep {latestEp.episode_number}: {latestEp.title}
                          </span>
                          <span className="text-[10px] font-mono text-indigo-400">
                            {latestEp.route === 'FULL_EPISODE' ? '20m Ep' : '3m Short'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 truncate">
                          {latestEp.full_script_json?.logline || 'Continuous episodic storyline'}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="pt-4 border-t border-slate-800/80 flex items-center gap-2">
                    <button
                      onClick={() => onResumeProject(series, latestEp, 'script')}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-purple-600 hover:from-rose-500 hover:to-purple-500 text-white text-xs font-bold shadow-md transition-all cursor-pointer"
                    >
                      <Play className="h-3.5 w-3.5" />
                      <span>Open Studio Pipeline</span>
                    </button>

                    <button
                      onClick={() => onSpawnSequel(series)}
                      className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
                      title="Spawn Sequel (Ep 2+) inheriting all Character & Environment Vaults"
                    >
                      <RefreshCw className="h-4 w-4 text-emerald-400" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* One-Click Presets */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-semibold block">
              Quick Concept Starters
            </span>
            <h2 className="text-2xl font-bold text-white font-['Cinzel',serif]">
              Studio Screenplay Presets
            </h2>
          </div>
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-1 text-xs">
            <button
              onClick={() => setActivePresetCategory('all')}
              className={`px-3 py-1 rounded-md transition-colors ${activePresetCategory === 'all' ? 'bg-slate-800 text-white font-medium' : 'text-slate-400 hover:text-slate-200'}`}
            >
              All
            </button>
            <button
              onClick={() => setActivePresetCategory('cyberpunk')}
              className={`px-3 py-1 rounded-md transition-colors ${activePresetCategory === 'cyberpunk' ? 'bg-slate-800 text-white font-medium' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Cyberpunk
            </button>
            <button
              onClick={() => setActivePresetCategory('fantasy')}
              className={`px-3 py-1 rounded-md transition-colors ${activePresetCategory === 'fantasy' ? 'bg-slate-800 text-white font-medium' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Dark Fantasy
            </button>
            <button
              onClick={() => setActivePresetCategory('action')}
              className={`px-3 py-1 rounded-md transition-colors ${activePresetCategory === 'action' ? 'bg-slate-800 text-white font-medium' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Action Sakuga
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredPresets.map((preset) => (
            <div
              key={preset.id}
              onClick={() => onSelectRouteAndCreate(preset.route, preset)}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-6 space-y-4 cursor-pointer transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5 group flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`px-2.5 py-0.5 text-[10px] font-mono font-bold rounded-full uppercase tracking-wider bg-gradient-to-r border ${preset.color}`}>
                    {preset.tag}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    {preset.runtime}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-base text-white font-['Cinzel',serif] group-hover:text-rose-300 transition-colors">
                    {preset.title}
                  </h3>
                  <p className="text-xs text-rose-400/90 font-mono mt-0.5">
                    {preset.genre}
                  </p>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">
                  {preset.description}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-mono text-[11px]">
                  Art: {preset.artStyle.split('_')[0]}
                </span>
                <span className="text-rose-400 font-bold flex items-center gap-1 group-hover:gap-2 transition-all">
                  <span>Use Preset</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Studio Engine & Architecture Quick Dock */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        
        {/* Neon PostgreSQL Architecture */}
        <div 
          onClick={onOpenSchemaModal}
          className="bg-slate-900/60 border border-slate-800 hover:border-sky-500/40 rounded-2xl p-6 cursor-pointer transition-all hover:bg-slate-900 group space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="h-10 w-10 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 group-hover:scale-110 transition-transform">
              <Database className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-mono text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded">
              7 Relational Tables
            </span>
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-100 font-['Cinzel',serif]">Vercel Neon PostgreSQL</h4>
            <p className="text-xs text-slate-400 mt-1">
              Inspect database schema, performance indexes, and Shariah-compliant prepaid wallet constraints.
            </p>
          </div>
        </div>

        {/* Python FastAPI / Celery Engine */}
        <div 
          onClick={onOpenPythonModal}
          className="bg-slate-900/60 border border-slate-800 hover:border-emerald-500/40 rounded-2xl p-6 cursor-pointer transition-all hover:bg-slate-900 group space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
              <Code2 className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
              FastAPI + Celery
            </span>
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-100 font-['Cinzel',serif]">Python Orchestration Suite</h4>
            <p className="text-xs text-slate-400 mt-1">
              Exportable backend blueprints for Seedance 2.5 Volcano Engine async workers and FFmpeg pipelines.
            </p>
          </div>
        </div>

        {/* Shariah Prepaid Wallet Guard */}
        <div 
          onClick={onOpenTopupModal}
          className="bg-slate-900/60 border border-slate-800 hover:border-purple-500/40 rounded-2xl p-6 cursor-pointer transition-all hover:bg-slate-900 group space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="h-10 w-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
              Balance: ${walletBalance.toFixed(2)}
            </span>
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-100 font-['Cinzel',serif]">Shariah-Compliant Prepaid Wallet</h4>
            <p className="text-xs text-slate-400 mt-1">
              Strict non-negative debit balance constraint with zero usury or overdraft debt.
            </p>
          </div>
        </div>

      </section>

    </div>
  );
};
