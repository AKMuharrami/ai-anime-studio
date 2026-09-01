import React, { useState } from 'react';
import JSZip from 'jszip';
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
  FolderOpen,
  Eye,
  Zap,
  CheckCircle2,
  Maximize2,
  FileText
} from 'lucide-react';
import { Series, Episode, Character, Environment } from '../types';
import { DRAFT_EXAMPLE_CHAPTER_PAGES } from './MangaStudioTab';

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

  const [activeDraftPageIndex, setActiveDraftPageIndex] = useState<number>(0);
  const [isZippingDraft, setIsZippingDraft] = useState<boolean>(false);

  const activeDraftPage = DRAFT_EXAMPLE_CHAPTER_PAGES[activeDraftPageIndex] || DRAFT_EXAMPLE_CHAPTER_PAGES[0];

  const handleLaunchDraftInStudio = () => {
    const unbrokenSeries = seriesList.find(s => s.id === 'ser_unbroken_lineage') || {
      id: 'ser_unbroken_lineage',
      user_id: 'usr_8829_alpha_neon',
      title: 'THE UNBROKEN LINEAGE',
      global_lore: 'In feudal Japan, an elderly wandering ronin traveler witnesses a courageous young boy standing up to ruthless bandits with a wooden bokken sword.',
      art_style_seed: 'GEKIGA_INK_WASH_MONOCHROME_HIGH_CONTRAST',
      created_at: '2026-08-30T10:00:00Z',
      updated_at: '2026-09-01T01:00:00Z',
    };

    const unbrokenEp = episodes.find(e => e.id === 'ep_manga_unbroken_01') || {
      id: 'ep_manga_unbroken_01',
      series_id: 'ser_unbroken_lineage',
      episode_number: 1,
      title: 'Chapter 1: The Wooden Blade (Draft Example)',
      route: 'MANGA_CHAPTER',
      full_script_json: {
        logline: 'An elderly ronin traveler witnesses a young boy defend his village against bandits with a wooden bokken.',
        synopsis: 'Chapter 1 follows Ronin watching from a hill, the boy confronting the bandits, striking back despite overwhelming odds, and standing proud even when his wooden blade breaks.',
        target_runtime_minutes: 3.0,
        route: 'MANGA_CHAPTER',
        scenes: []
      },
      created_at: '2026-08-30T10:00:00Z',
      updated_at: '2026-09-01T01:00:00Z'
    };

    onResumeProject(unbrokenSeries, unbrokenEp);
  };

  const handleDownloadDraftZip = async () => {
    setIsZippingDraft(true);
    try {
      const zip = new JSZip();
      const folder = zip.folder("The_Unbroken_Lineage_Chapter_1_Draft");
      
      folder?.file("chapter_metadata.json", JSON.stringify({
        seriesTitle: "THE UNBROKEN LINEAGE",
        chapterTitle: "Chapter 1: The Wooden Blade",
        pagesCount: DRAFT_EXAMPLE_CHAPTER_PAGES.length,
        pages: DRAFT_EXAMPLE_CHAPTER_PAGES
      }, null, 2));

      for (let pIdx = 0; pIdx < DRAFT_EXAMPLE_CHAPTER_PAGES.length; pIdx++) {
        const pageObj = DRAFT_EXAMPLE_CHAPTER_PAGES[pIdx];
        const pageFolder = folder?.folder(`Page_${pageObj.pageNumber}`);
        pageFolder?.file("page_script.json", JSON.stringify(pageObj, null, 2));

        for (let pnlIdx = 0; pnlIdx < pageObj.panels.length; pnlIdx++) {
          const pnl = pageObj.panels[pnlIdx];
          if (pnl.imageUrl) {
            try {
              const resp = await fetch(pnl.imageUrl);
              const blob = await resp.blob();
              pageFolder?.file(`Panel_${pnl.panelIndex}.jpg`, blob);
            } catch (err) {
              console.error('Error fetching image for zip', err);
            }
          }
        }
      }

      const content = await zip.generateAsync({ type: 'blob' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(content);
      link.download = `Unbroken_Lineage_Chapter_1_Draft_3Pages.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Failed to create ZIP', err);
      alert('Chapter metadata downloaded!');
    } finally {
      setIsZippingDraft(false);
    }
  };

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
            <span>AI Manga Studio Pro Engine • Ultra-Consistent Character Turnarounds • Decoupled Multi-Reference Architecture</span>
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
              onClick={handleLaunchDraftInStudio}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold transition-all cursor-pointer"
            >
              <BookOpen className="h-4 w-4 text-amber-400" />
              <span>Open 3-Page Draft Chapter</span>
            </button>
          </div>

        </div>
      </section>

      {/* FEATURED CHAPTER DRAFT EXAMPLE (VISITOR INTERACTIVE SHOWCASE) */}
      <section className="bg-slate-900/90 border-2 border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-amber-500/10 via-transparent to-transparent blur-2xl pointer-events-none" />

        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-xs font-mono font-bold text-amber-300 mb-2">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              <span>LIVE FEATURED CHAPTER DRAFT EXAMPLE</span>
            </div>
            <h2 className="text-2xl font-black text-white font-['Cinzel',serif] flex items-center gap-3">
              <span>Chapter 1: The Wooden Blade</span>
              <span className="text-xs font-mono font-normal text-slate-400 bg-slate-950 px-2.5 py-1 rounded-md border border-slate-800">
                3-Page Chapter Draft
              </span>
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              An example modest manga draft created in AI Manga Studio. Explore Pages 1, 2, & 3 below with full panels, dialogue, and character continuity, or jump directly into the Studio Editor.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={handleLaunchDraftInStudio}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
            >
              <Zap className="h-4 w-4 fill-slate-950" />
              <span>Open Draft in Studio Editor</span>
            </button>

            <button
              onClick={handleDownloadDraftZip}
              disabled={isZippingDraft}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-200 text-xs font-bold transition-all cursor-pointer"
            >
              <Download className="h-4 w-4 text-amber-400" />
              <span>{isZippingDraft ? 'Zipping Draft...' : 'Download ZIP'}</span>
            </button>
          </div>
        </div>

        {/* Page Switcher Tabs */}
        <div className="flex flex-wrap items-center gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800/80">
          {DRAFT_EXAMPLE_CHAPTER_PAGES.map((pg, idx) => {
            const pageTitles = ['Page 1: The Encounter', 'Page 2: The Action Strike', 'Page 3: The Broken Blade'];
            const isActive = activeDraftPageIndex === idx;
            return (
              <button
                key={pg.id}
                onClick={() => setActiveDraftPageIndex(idx)}
                className={`flex-1 min-w-[140px] px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <BookOpen className={`h-3.5 w-3.5 ${isActive ? 'text-slate-950' : 'text-amber-400'}`} />
                <span>{pageTitles[idx] || `Page ${idx + 1}`}</span>
                <span className={`ml-auto text-[10px] font-mono px-1.5 py-0.2 rounded ${isActive ? 'bg-slate-950/20 text-slate-950 font-bold' : 'bg-slate-900 text-slate-400'}`}>
                  {pg.panels.length} Panels
                </span>
              </button>
            );
          })}
        </div>

        {/* Selected Page Panels Showcase (EXACT PIPELINE RATIO & CANVAS MATCHING MANGASTUDIOTAB) */}
        <div className="bg-stone-950 p-6 sm:p-8 rounded-2xl border border-amber-900/30 space-y-6 shadow-inner">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-800/80 pb-3">
            <div className="flex items-center gap-2 font-mono text-xs text-amber-300">
              <Layers className="h-4 w-4 text-amber-400" />
              <span className="font-bold">DRAFT PAGE {activeDraftPage.pageNumber} • WORKSPACE PIPELINE CANVAS</span>
              <span className="text-stone-500">•</span>
              <span className="text-stone-400 font-sans hidden md:inline">Print B5 Ratio (1:1.58) • Screentone Ink</span>
            </div>
            <span className="text-[10px] font-mono text-stone-400 bg-stone-900 px-2.5 py-1 rounded border border-stone-800 w-fit">
              Exact Pipeline Ratio: 1 : 1.58 (B5 Manga Print)
            </span>
          </div>

          {/* EXACT PIPELINE MANGA CANVAS (PORTRAIT 1:1.58 RATIO MATCHING MANGASTUDIOTAB WORKSPACE, SCALED 20%) */}
          <div className="bg-white border-8 border-black rounded-xl p-3.5 sm:p-5 shadow-2xl relative w-full max-w-lg aspect-[1/1.58] mx-auto overflow-hidden flex flex-col justify-between select-none">
            
            {/* GRID PANEL WRAPPER */}
            <div className="flex flex-col h-full justify-between gap-3 relative flex-1 mb-4">
              
              {/* ROW 1: PANEL 1 (TOP PANORAMIC PANEL) */}
              {activeDraftPage.panels[0] && (
                <div className="w-full h-[48%] border-4 border-black relative overflow-hidden group">
                  <img
                    src={activeDraftPage.panels[0].imageUrl}
                    alt={`Panel 1`}
                    className="w-full h-full object-cover grayscale contrast-125 brightness-95 transition-transform duration-300 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  {/* Screentone texture simulation */}
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-transparent to-black/10 mix-blend-multiply pointer-events-none" />
                  
                  {/* Panel Number Badge */}
                  <div className="absolute top-2 left-2 bg-black text-white text-[10px] font-black font-mono h-5 w-5 flex items-center justify-center rounded z-10 shadow-md">
                    1
                  </div>

                  {/* Character Tags */}
                  <div className="absolute top-2 right-2 flex gap-1 z-10">
                    {activeDraftPage.panels[0].charactersPresent.map((c, i) => (
                      <span key={i} className="bg-black/80 text-white text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border border-white/20">
                        {c}
                      </span>
                    ))}
                  </div>

                  {/* Speech Bubble Overlay */}
                  {activeDraftPage.panels[0].speechText && (
                    <div 
                      className="absolute z-20 max-w-[75%] bg-white text-black px-3 py-2 rounded-2xl border-2 border-black font-sans text-xs font-bold leading-snug shadow-2xl text-center"
                      style={{
                        top: `${activeDraftPage.panels[0].bubbleY || 20}%`,
                        left: `${activeDraftPage.panels[0].bubbleX || 50}%`,
                        transform: 'translate(-50%, 0)'
                      }}
                    >
                      {activeDraftPage.panels[0].speechText}
                      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-black" />
                    </div>
                  )}
                </div>
              )}

              {/* ROW 2: SPLIT PANELS 2 & 3 */}
              <div className="w-full h-[48%] flex flex-row gap-3">
                {activeDraftPage.panels.slice(1, 3).map((pnl, idx) => {
                  const panelNumber = idx + 2;
                  return (
                    <div key={pnl.id || panelNumber} className="w-1/2 h-full border-4 border-black relative overflow-hidden group">
                      <img
                        src={pnl.imageUrl}
                        alt={`Panel ${panelNumber}`}
                        className="w-full h-full object-cover grayscale contrast-125 brightness-95 transition-transform duration-300 group-hover:scale-105"
                        referrerPolicy="no-referrer"
                      />
                      {/* Screentone texture simulation */}
                      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-transparent to-black/10 mix-blend-multiply pointer-events-none" />

                      {/* Panel Number Badge */}
                      <div className="absolute top-2 left-2 bg-black text-white text-[10px] font-black font-mono h-5 w-5 flex items-center justify-center rounded z-10 shadow-md">
                        {panelNumber}
                      </div>

                      {/* Character Tags */}
                      <div className="absolute top-2 right-2 flex gap-1 z-10">
                        {pnl.charactersPresent.map((c, i) => (
                          <span key={i} className="bg-black/80 text-white text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border border-white/20">
                            {c}
                          </span>
                        ))}
                      </div>

                      {/* Speech Bubble Overlay */}
                      {pnl.speechText && (
                        <div 
                          className="absolute z-20 max-w-[85%] bg-white text-black px-2.5 py-1.5 rounded-2xl border-2 border-black font-sans text-[11px] font-bold leading-tight shadow-2xl text-center"
                          style={{
                            top: `${pnl.bubbleY || 30}%`,
                            left: `${pnl.bubbleX || 50}%`,
                            transform: 'translate(-50%, 0)'
                          }}
                        >
                          {pnl.speechText}
                          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[7px] border-t-black" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

            </div>

            {/* PAGE FOOTER TEXT EXACT MATCH */}
            <div className="text-[10px] font-black text-black font-mono tracking-widest uppercase text-center shrink-0 border-t border-black/10 pt-1">
              PAGE {activeDraftPage.pageNumber} • THE UNBROKEN LINEAGE • CHAPTER 1
            </div>
          </div>

          {/* DRAFT PAGE PANEL PROMPTS & DETAILS BREAKDOWN CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
            {activeDraftPage.panels.map((pnl) => (
              <div key={pnl.id} className="bg-stone-900/90 border border-stone-800 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    Panel #{pnl.panelIndex}
                  </span>
                  <div className="flex gap-1">
                    {pnl.charactersPresent.map((c, i) => (
                      <span key={i} className="text-[10px] bg-stone-950 text-slate-300 px-1.5 py-0.5 rounded border border-stone-700">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
                <p className="text-xs text-slate-300 font-serif italic leading-snug line-clamp-3">
                  "{pnl.actionPrompt}"
                </p>
                {pnl.expression && (
                  <p className="text-[10px] text-slate-400 font-mono">
                    <strong className="text-slate-300">Expression:</strong> {pnl.expression}
                  </p>
                )}
              </div>
            ))}
          </div>

        </div>

        {/* Section Footer Callout */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-950/80 p-4 rounded-2xl border border-slate-800 text-xs">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
            <span className="text-slate-300">
              This 3-page draft is fully pre-loaded into your session state. Click <strong className="text-amber-300">Open Draft in Studio Editor</strong> to add pages, re-render panels, or edit dialogue text.
            </span>
          </div>
          <button
            onClick={handleLaunchDraftInStudio}
            className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold transition-all cursor-pointer"
          >
            <span>Launch Studio Now</span>
            <ArrowRight className="h-3.5 w-3.5 text-amber-400" />
          </button>
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
