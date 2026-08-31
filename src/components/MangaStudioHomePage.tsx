import React, { useState } from 'react';
import { 
  Sparkles, 
  BookOpen, 
  ArrowRight, 
  Cpu, 
  Layers, 
  MessageSquare, 
  Layout, 
  ShieldCheck, 
  Clock, 
  Download, 
  Copy, 
  Check, 
  FileCode, 
  Play, 
  Printer, 
  ChevronRight, 
  Plus, 
  UserCheck, 
  ImageIcon,
  RefreshCw,
  FolderOpen
} from 'lucide-react';
import { Series, Episode, Character, Environment } from '../types';

interface MangaStudioHomePageProps {
  seriesList: Series[];
  episodes: Episode[];
  characters: Character[];
  environments: Environment[];
  onSelectRouteAndCreate: (route: any, preset?: any) => void;
  onResumeProject: (series: Series, episode: Episode) => void;
  onOpenPythonModal: () => void;
  onSwitchToAnime: () => void;
}

export const MangaStudioHomePage: React.FC<MangaStudioHomePageProps> = ({
  seriesList,
  episodes,
  characters,
  environments,
  onSelectRouteAndCreate,
  onResumeProject,
  onOpenPythonModal,
  onSwitchToAnime
}) => {
  const [copiedPayload, setCopiedPayload] = useState(false);
  
  // Filter only manga projects
  const mangaEpisodes = episodes.filter(e => e.route.startsWith('MANGA_'));
  
  // Curated professional manga story presets for immediate launch
  const mangaPresets = [
    {
      id: 'manga_preset_1',
      title: 'COGNITIVE CHIP: CODE GENESIS',
      genre: 'Cyberpunk Noir & Gekiga Line-art',
      tag: 'Retro Screentone • Chapter 1',
      artStyle: 'GEKIGA_INK_WASH_MONOCHROME_HIGH_CONTRAST',
      description: 'In a dark, grid-locked cyberspace server room, a skilled programmer works to dismantle a corrupted AI mind-core while under corporate laser fire. Modesty-compliant tactical clothing.',
      color: 'from-amber-950/20 to-stone-900/30 border-amber-500/20 text-amber-200'
    },
    {
      id: 'manga_preset_2',
      title: 'ASTRAL TEMPLE: MONOLITH ASCENT',
      genre: 'Historical Fiction & Ink Brush Style',
      tag: 'Classic Shonen Screentone',
      artStyle: 'WIT_STUDIO_DARK_FANTASY_INK_ILLUSTRATION',
      description: 'A determined guardian defends a grand ancient fortress from invading rogue mechanical drones, drawing a master-crafted broadsword. Modest attire, honorable themes.',
      color: 'from-rose-950/20 to-stone-900/30 border-rose-500/20 text-rose-200'
    }
  ];

  const handleCopyCommand = () => {
    navigator.clipboard.writeText("celery -A manga_tasks worker --loglevel=info");
    setCopiedPayload(true);
    setTimeout(() => setCopiedPayload(false), 2000);
  };

  return (
    <div className="space-y-12 pb-16 animate-fadeIn">
      
      {/* EXQUISITE MANGA ADVERTISEMENT/SWITCHER PROMOTIONAL HEADER */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-amber-500/5 to-transparent pointer-events-none" />
        <div className="flex items-center gap-4 relative z-10">
          <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
            <RefreshCw className="h-5 w-5 text-amber-400" />
          </div>
          <div>
            <span className="text-[10px] font-mono tracking-widest font-bold uppercase rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5">
              Production Mode: AI Manga Studio
            </span>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              Currently viewing the <span className="text-amber-300 font-bold">Professional AI Manga Studio</span>. The high-compute Anime & Cinematic Video suite is currently offline for architectural upgrades and development.
            </p>
          </div>
        </div>
        <button
          disabled
          className="relative z-10 shrink-0 w-full md:w-auto flex items-center justify-center gap-1.5 px-5 py-2 rounded-xl bg-slate-950/50 text-slate-500 border border-slate-800 text-xs font-semibold cursor-not-allowed"
        >
          <span>Anime Studio (In Development)</span>
        </button>
      </div>

      {/* HERO SECTION FOR MANGA STUDIO */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-stone-900 via-stone-900/90 to-slate-950 border border-amber-900/30 p-8 sm:p-12 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-96 h-96 bg-gradient-to-br from-amber-500/5 via-stone-700/5 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-96 h-96 bg-gradient-to-tr from-stone-800/10 via-amber-950/5 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-950/90 border border-amber-900/20 text-xs text-amber-200 font-mono shadow-inner">
            <span className="flex h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
            <span>SiliconFlow Prepaid Endpoint • Qwen-Image-Edit Turnarounds • Decoupled Multi-Reference Architecture</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white font-['Cinzel',serif] leading-tight">
            Create Complete Manga Series with Flawless Continuity
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto font-sans leading-relaxed">
            Effortlessly craft world-class, story-driven manga from the storyline/plot to the consistent character/scene creation vault to the manga page panel creation to the text editor. Leverage our powerful AI layout engines and strictly enforced character identity vaults to generate beautiful, continuous chapters—complete with expressive panels and dialogue—instantly.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2 text-xs font-mono text-slate-400">
            <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-950/30 text-amber-300 rounded-lg border border-amber-500/20">
              <ShieldCheck className="h-3.5 w-3.5 text-amber-400" />
              <span>Modest Style & Layout Compliant</span>
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1 bg-slate-950/60 rounded-lg border border-slate-800">
              <Cpu className="h-3.5 w-3.5 text-amber-400" />
              <span>Qwen-Image-Edit (Style Invariant)</span>
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1 bg-slate-950/60 rounded-lg border border-slate-800">
              <Layout className="h-3.5 w-3.5 text-stone-400" />
              <span>Gekiga Screentone Monochrome</span>
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <button
              onClick={() => onSelectRouteAndCreate('MANGA_CHAPTER')}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 text-white font-bold text-sm shadow-lg shadow-amber-600/20 transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Start New Manga Chapter</span>
            </button>
            <button
              onClick={() => alert("Community Manga Gallery is launching soon! You will be able to inspect full chapters and short stories generated by our users.")}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-300 text-xs font-bold transition-all cursor-pointer"
            >
              <BookOpen className="h-4 w-4 text-amber-400" />
              <span>View Community Manga Gallery (Coming Soon)</span>
            </button>
          </div>

        </div>
      </section>

      {/* MANGA WORKFLOW STEPPING BLUEPRINT DISPLAY */}
      <section className="space-y-6">
        <div className="text-center space-y-1.5">
          <h2 className="text-xl font-bold font-['Cinzel',serif] tracking-wider text-slate-100 uppercase">
            The Decoupled Manga Studio Workflow
          </h2>
          <p className="text-xs text-slate-400 max-w-xl mx-auto">
            An elegant process engineered by industry experts to safeguard character model details and slash operational costs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              route: 'MANGA_SINGLE_PAGE',
              title: 'Single Page Blueprint',
              desc: 'Start with a hyper-focused single manga page. Ideal for complex illustrations, splash pages, and proof of concepts.',
              icon: Layout,
              color: 'text-blue-400 bg-blue-500/10 border-blue-500/20'
            },
            {
              route: 'MANGA_CHAPTER',
              title: 'Chapter Workflow',
              desc: 'The standard sequential pipeline. Generates multiple connected pages with perfect character and environment continuity.',
              icon: Layers,
              color: 'text-amber-400 bg-amber-500/10 border-amber-500/20'
            },
            {
              route: 'MANGA_VOLUME',
              title: 'Full Manga Volume',
              desc: 'Architect a sprawling volume with robust vault integration. Preserves continuity across multiple chapters.',
              icon: BookOpen,
              color: 'text-rose-400 bg-rose-500/10 border-rose-500/20'
            }
          ].map((w, idx) => (
            <div 
              key={idx}
              onClick={() => onSelectRouteAndCreate(w.route as any)}
              className="bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800/80 hover:border-slate-600 p-6 rounded-2xl relative space-y-4 flex flex-col justify-between cursor-pointer transition-all hover:-translate-y-1 shadow-lg"
            >
              <div className="space-y-4">
                <div className={`h-12 w-12 rounded-xl border flex items-center justify-center ${w.color}`}>
                  <w.icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-100 text-lg mt-0.5">{w.title}</h3>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{w.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* DETAILED MANGA DRAFTS & ACTIVE CHAPTERS */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COMPONENT: RESUME MANGA DRAFTS (7 Columns) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FolderOpen className="h-4 w-4 text-amber-400" />
                <h2 className="font-bold text-slate-100 text-sm font-['Cinzel',serif] tracking-wider uppercase">
                  Manga Chapter Drafts
                </h2>
              </div>
              <span className="text-[10px] font-mono text-slate-500 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                {mangaEpisodes.length} Chapters Active
              </span>
            </div>

            {mangaEpisodes.length === 0 ? (
              <div className="text-center py-10 px-4 space-y-3 bg-slate-950/40 rounded-2xl border border-slate-800/60">
                <BookOpen className="h-10 w-10 text-slate-600 mx-auto" />
                <div className="space-y-1">
                  <span className="block text-xs font-bold text-slate-300">No active manga drafts</span>
                  <p className="text-[11px] text-slate-500">Launch from one of the custom Gekiga presets or click create above!</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3.5">
                {mangaEpisodes.map((ep) => {
                  const series = seriesList.find(s => s.id === ep.series_id) || seriesList[0];
                  return (
                    <div 
                      key={ep.id}
                      onClick={() => onResumeProject(series, ep)}
                      className="group p-4 bg-slate-950/60 hover:bg-slate-900/80 border border-slate-800 hover:border-amber-500/30 rounded-2xl flex items-center justify-between gap-4 transition-all cursor-pointer shadow-sm hover:translate-x-1"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-slate-900 border-2 border-black flex items-center justify-center text-amber-400 font-bold font-mono">
                          M
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-slate-200 group-hover:text-amber-300 transition-colors">
                              {ep.title}
                            </span>
                            <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                              Active Layout
                            </span>
                          </div>
                          <span className="block text-[10px] text-slate-500 font-mono mt-1">
                            Series ID: {series?.title || 'COGNITIVE CHIP'} • Last update: {new Date(ep.updated_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-slate-600 group-hover:text-amber-400 transition-colors" />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COMPONENT: PRE-COMMITTED GEKIGA STORY PRESETS (5 Columns) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <Sparkles className="h-4 w-4 text-amber-400" />
              <h2 className="font-bold text-slate-100 text-sm font-['Cinzel',serif] tracking-wider uppercase">
                Curated Modest Presets
              </h2>
            </div>

            <div className="space-y-4">
              {mangaPresets.map((preset) => (
                <div
                  key={preset.id}
                  onClick={() => onSelectRouteAndCreate('MANGA_CHAPTER', preset)}
                  className={`p-4 rounded-2xl border bg-gradient-to-br ${preset.color} hover:scale-[1.01] transition-all cursor-pointer group space-y-3`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[9px] font-mono tracking-widest font-bold uppercase rounded bg-black/40 text-amber-300 border border-amber-500/10 px-2 py-0.5">
                        {preset.tag}
                      </span>
                      <h4 className="font-black text-white text-xs mt-2 font-['Cinzel',serif] group-hover:text-amber-300 transition-colors">
                        {preset.title}
                      </h4>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-normal">
                    {preset.description}
                  </p>
                  <div className="pt-2 flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <span>Art: {preset.artStyle.replace(/_/g, ' ')}</span>
                    <span className="text-amber-400 font-bold group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                      Load Preset <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </section>

    </div>
  );
};
