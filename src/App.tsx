import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { StudioHomePage } from './components/StudioHomePage';
import { ProjectRouterModal } from './components/ProjectRouterModal';
import { ScriptTimelineParserTab } from './components/ScriptTimelineParserTab';
import { StudioDesignVaultTab } from './components/StudioDesignVaultTab';
import { SeedanceMultimodalStudioTab } from './components/SeedanceMultimodalStudioTab';
import { SoundVoiceStudioTab } from './components/SoundVoiceStudioTab';
import { TimelineCompilerTab } from './components/TimelineCompilerTab';
import { MangaStudioTab } from './components/MangaStudioTab';
import { MangaStudioHomePage } from './components/MangaStudioHomePage';
import { DatabaseArchitectureModal } from './components/DatabaseArchitectureModal';
import { PythonOrchestrationModal } from './components/PythonOrchestrationModal';
import { WalletTopupModal } from './components/WalletTopupModal';
import { 
  INITIAL_USER, 
  INITIAL_SERIES, 
  INITIAL_EPISODES, 
  INITIAL_CHARACTERS, 
  INITIAL_ENVIRONMENTS, 
  INITIAL_SCENES 
} from './data/mockData';
import { Series, Episode, Character, Environment, Scene, ScreenplayData, ProjectRoute } from './types';

export default function App() {
  // Navigation View: 'home' | 'studio'
  const [currentView, setCurrentView] = useState<'home' | 'studio'>('home');
  const [homepageMode, setHomepageMode] = useState<'anime' | 'manga'>('manga');

  // Global State
  const [user, setUser] = useState(INITIAL_USER);
  const [seriesList, setSeriesList] = useState<Series[]>(INITIAL_SERIES);
  const [activeSeries, setActiveSeries] = useState<Series | null>(INITIAL_SERIES[0]);
  
  const [episodes, setEpisodes] = useState<Episode[]>(INITIAL_EPISODES);
  const [activeEpisode, setActiveEpisode] = useState<Episode | null>(INITIAL_EPISODES[0]);

  const [characters, setCharacters] = useState<Character[]>(INITIAL_CHARACTERS);
  const [environments, setEnvironments] = useState<Environment[]>(INITIAL_ENVIRONMENTS);
  const [scenes, setScenes] = useState<Scene[]>(INITIAL_SCENES);

  // Active Pipeline Tab: 'script' | 'vault' | 'seedance' | 'timeline'
  const [activeTab, setActiveTab] = useState<string>('script');

  // Modals
  const [isProjectRouterOpen, setIsProjectRouterOpen] = useState(false);
  const [modalInitialRoute, setModalInitialRoute] = useState<ProjectRoute>('FULL_EPISODE');
  const [modalInitialPreset, setModalInitialPreset] = useState<any>(null);

  const [isSchemaModalOpen, setIsSchemaModalOpen] = useState(false);
  const [isPythonModalOpen, setIsPythonModalOpen] = useState(false);
  const [isTopupModalOpen, setIsTopupModalOpen] = useState(false);

  // Filter entities for active series / episode
  const currentCharacters = characters.filter(c => c.series_id === activeSeries?.id);
  const currentEnvironments = environments.filter(e => e.series_id === activeSeries?.id);
  const currentScenes = scenes.filter(s => s.episode_id === activeEpisode?.id);

  // Sync state when series changes
  const handleSelectSeries = (s: Series) => {
    setActiveSeries(s);
    const eps = episodes.filter(e => e.series_id === s.id);
    if (eps.length > 0) {
      setActiveEpisode(eps[0]);
    }
  };

  const handleSelectEpisode = (ep: Episode) => {
    setActiveEpisode(ep);
  };

  // Top-up Handler (Prepaid balance)
  const handleTopup = (amount: number) => {
    setUser(prev => ({
      ...prev,
      wallet_balance: prev.wallet_balance + amount
    }));
  };

  // Token Deduction Engine
  const deductTokens = async (tokenCost: number, reason: string): Promise<boolean> => {
    // 1 USD = 10 Tokens. We store wallet_balance in USD natively.
    const usdCost = tokenCost / 10;
    
    if (user.wallet_balance < usdCost) {
      alert(`Insufficient Studio Tokens!\nCost: ${tokenCost} Tokens.\nYou have: ${(user.wallet_balance * 10).toLocaleString()} Tokens.\n\nPlease Top-Up to continue ${reason}.`);
      setIsTopupModalOpen(true);
      return false;
    }
    
    // Deduct immediately in optimistic UI state
    setUser(prev => ({
      ...prev,
      wallet_balance: Math.max(0, prev.wallet_balance - usdCost)
    }));
    
    // In a full production build, we'd hit /api/wallet/deduct here.
    return true;
  };

  const handleSubscribe = (tier: string) => {
    setUser(prev => ({
      ...prev,
      subscription_tier: tier as any,
      subscription_status: 'ACTIVE'
    }));
  };

  // Homepage: Click Route A or Route B or Preset
  const handleSelectRouteAndCreate = (route: ProjectRoute, preset?: any) => {
    setModalInitialRoute(route);
    setModalInitialPreset(preset || null);
    setIsProjectRouterOpen(true);
  };

  // Homepage: Click Resume Project
  const handleResumeProject = (series: Series, episode: Episode, step: string = 'script') => {
    setActiveSeries(series);
    setActiveEpisode(episode);
    setActiveTab(step);
    setCurrentView('studio');
  };

  // New Project Created from Router
  const handleProjectCreated = (data: any) => {
    const newSeries: Series = data.series;
    const newEpisode: Episode = data.episode;

    setSeriesList(prev => [newSeries, ...prev]);
    setActiveSeries(newSeries);
    setEpisodes(prev => [newEpisode, ...prev]);
    setActiveEpisode(newEpisode);
    setActiveTab('script');
    setCurrentView('studio');
  };

  // Update Episode Script & Scene Breakdown
  const handleUpdateEpisodeScript = (scriptData: ScreenplayData) => {
    if (!activeEpisode) return;

    const updatedEp: Episode = {
      ...activeEpisode,
      full_script_json: scriptData,
      updated_at: new Date().toISOString()
    };

    setActiveEpisode(updatedEp);
    setEpisodes(prev => prev.map(e => e.id === updatedEp.id ? updatedEp : e));

    // Convert script scenes into Scene records if needed
    if (scriptData.scenes && scriptData.scenes.length > 0) {
      const generatedScenes: Scene[] = scriptData.scenes.map((sc, i) => {
        const existing = scenes.find(s => s.episode_id === activeEpisode.id && s.scene_index === sc.scene_index);
        if (existing) {
          return {
            ...existing,
            action_prompt: sc.action_prompt,
            location_name: sc.location_name,
            duration_seconds: sc.estimated_duration,
            characters_present_names: sc.characters_present
          };
        }

        const env = environments.find(e => e.location_name.toLowerCase() === sc.location_name.toLowerCase()) || environments[0] || {
          id: `env_auto_${Date.now()}`,
          series_id: activeSeries?.id || '',
          location_name: sc.location_name,
          qwen_prompt_raw: `4K Master Anime Background: ${sc.location_name}`,
          lighting_condition: 'NEON_CYBER_DUSK',
          perspective_grid_url: '',
          clean_background_url: '',
          created_at: new Date().toISOString()
        };

        return {
          id: `scn_gen_${Date.now()}_${i + 1}`,
          episode_id: activeEpisode.id,
          scene_index: sc.scene_index,
          environment_id: env.id,
          duration_seconds: sc.estimated_duration || (activeEpisode.route === 'FULL_EPISODE' ? 30 : 8),
          action_prompt: sc.action_prompt,
          video_url: undefined,
          audio_url: `https://api.mumantij-ai.com/storage/audio/scene_${i + 1}.mp3`,
          rendering_status: 'UNRENDERED' as const,
          location_name: sc.location_name,
          characters_present_names: sc.characters_present,
          dialogue: sc.dialogue?.map(d => ({
            speaker: d.speaker,
            line: d.line,
            fish_voice_token: 'FISH_VOICE_JP_MALE_TACTICAL_BARITONE_01'
          })),
          created_at: new Date().toISOString()
        };
      });

      setScenes(prev => {
        const otherScenes = prev.filter(s => s.episode_id !== activeEpisode.id);
        return [...otherScenes, ...generatedScenes];
      });
    }
  };

  // Add Environment to Vault
  const handleAddEnvironment = (newEnv: Environment) => {
    setEnvironments(prev => [newEnv, ...prev]);
  };

  // Add Character to Vault
  const handleAddCharacter = (newChar: Character) => {
    setCharacters(prev => [newChar, ...prev]);
  };

  // Batch Add Characters and Environments to Vault
  const handleBatchAddEntities = (newChars: Character[], newEnvs: Environment[]) => {
    if (newChars && newChars.length > 0) {
      setCharacters(prev => {
        const existingNames = new Set(prev.map(c => c.name.toLowerCase()));
        const uniqueNew = newChars.filter(c => !existingNames.has(c.name.toLowerCase()));
        return [...uniqueNew, ...prev];
      });
    }
    if (newEnvs && newEnvs.length > 0) {
      setEnvironments(prev => {
        const existingLocs = new Set(prev.map(e => e.location_name.toLowerCase()));
        const uniqueNew = newEnvs.filter(e => !existingLocs.has(e.location_name.toLowerCase()));
        return [...uniqueNew, ...prev];
      });
    }
  };

  // Update Individual Scene (e.g. from Seedance render or duration slider)
  const handleUpdateScene = (sceneId: string, updated: Partial<Scene>) => {
    setScenes(prev => prev.map(s => s.id === sceneId ? { ...s, ...updated } : s));
  };

  // Update Master Compiled Video URL
  const handleUpdateEpisodeMasterVideo = (videoUrl: string) => {
    if (!activeEpisode) return;
    const updatedEp: Episode = {
      ...activeEpisode,
      master_video_url: videoUrl,
      updated_at: new Date().toISOString()
    };
    setActiveEpisode(updatedEp);
    setEpisodes(prev => prev.map(e => e.id === updatedEp.id ? updatedEp : e));
  };

  // Spawn Sequel Episode (Ep 2+)
  const handleSpawnSequel = (targetSeries?: Series) => {
    const series = targetSeries || activeSeries;
    if (!series) return;

    const seriesEps = episodes.filter(e => e.series_id === series.id);
    const nextEpNum = seriesEps.length + 1;
    const lastEp = seriesEps[seriesEps.length - 1];

    const newEp: Episode = {
      id: `ep_${Date.now()}_0${nextEpNum}`,
      series_id: series.id,
      episode_number: nextEpNum,
      title: `Episode ${nextEpNum}: The Unbroken Lineage`,
      route: lastEp?.route || 'FULL_EPISODE',
      full_script_json: {
        logline: `Continuing the saga of ${series.title}.`,
        synopsis: `Direct episodic continuation following Episode ${nextEpNum - 1}, carrying all character Soul IDs and 4K environment layouts.`,
        target_runtime_minutes: (lastEp?.route || 'FULL_EPISODE') === 'FULL_EPISODE' ? 20.0 : 2.5,
        route: lastEp?.route || 'FULL_EPISODE',
        scenes: []
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    setEpisodes(prev => [...prev, newEp]);
    setActiveSeries(series);
    setActiveEpisode(newEp);
    setActiveTab('script');
    setCurrentView('studio');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-rose-500 selection:text-white">
      
      {/* Top Navbar */}
      <Navbar
        currentView={currentView}
        onNavigateHome={() => setCurrentView('home')}
        onNavigateStudio={() => setCurrentView('studio')}
        seriesList={seriesList}
        activeSeries={activeSeries}
        onSelectSeries={handleSelectSeries}
        episodes={episodes.filter(e => e.series_id === activeSeries?.id)}
        activeEpisode={activeEpisode}
        onSelectEpisode={handleSelectEpisode}
        walletBalance={user.wallet_balance}
        onOpenTopupModal={() => setIsTopupModalOpen(true)}
        onOpenProjectRouter={() => {
          setModalInitialRoute('FULL_EPISODE');
          setModalInitialPreset(null);
          setIsProjectRouterOpen(true);
        }}
        onOpenSchemaModal={() => setIsSchemaModalOpen(true)}
        onOpenPythonModal={() => setIsPythonModalOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onSpawnSequel={() => handleSpawnSequel()}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* HOMEPAGE VIEW: Single, Pristine, Focused Studio Hub */}
        {currentView === 'home' && (
          homepageMode === 'manga' ? (
            <MangaStudioHomePage
              seriesList={seriesList}
              episodes={episodes}
              characters={characters}
              environments={environments}
              onSelectRouteAndCreate={handleSelectRouteAndCreate}
              onResumeProject={handleResumeProject}
              onOpenPythonModal={() => setIsPythonModalOpen(true)}
              onSwitchToAnime={() => setHomepageMode('anime')}
            />
          ) : (
            <StudioHomePage
              seriesList={seriesList}
              episodes={episodes}
              characters={characters}
              environments={environments}
              walletBalance={user.wallet_balance}
              onSelectRouteAndCreate={handleSelectRouteAndCreate}
              onResumeProject={handleResumeProject}
              onOpenTopupModal={() => setIsTopupModalOpen(true)}
              onOpenSchemaModal={() => setIsSchemaModalOpen(true)}
              onOpenPythonModal={() => setIsPythonModalOpen(true)}
              onSpawnSequel={handleSpawnSequel}
              onSwitchToManga={() => setHomepageMode('manga')}
            />
          )
        )}

        {/* STUDIO PIPELINE VIEW: Guided 4-Step Production Workflow */}
        {currentView === 'studio' && (
          <div className="space-y-6">
            
            {activeEpisode?.route?.startsWith('MANGA_') ? (
              <MangaStudioTab
                activeSeries={activeSeries}
                activeEpisode={activeEpisode}
                characters={currentCharacters}
                environments={currentEnvironments}
                onAddCharacter={handleAddCharacter}
                onAddEnvironment={handleAddEnvironment}
                onBackToHome={() => setCurrentView('home')}
                deductTokens={deductTokens}
              />
            ) : (
              <>
                {/* STEP 1: DeepSeek Screenplay & Timeline Parser */}
                {activeTab === 'script' && (
                  <ScriptTimelineParserTab
                    activeEpisode={activeEpisode}
                    activeSeries={activeSeries}
                    onUpdateEpisodeScript={handleUpdateEpisodeScript}
                    onProceedToVault={() => setActiveTab('vault')}
                    onBatchAddEntities={handleBatchAddEntities}
                    deductTokens={deductTokens}
                  />
                )}

                {/* STEP 2: Studio Design Vault (Qwen 2.5-VL 4K Layouts & Turnarounds) */}
                {activeTab === 'vault' && (
                  <StudioDesignVaultTab
                    activeSeries={activeSeries}
                    activeEpisode={activeEpisode}
                    characters={currentCharacters}
                    environments={currentEnvironments}
                    scenes={currentScenes}
                    onAddCharacter={handleAddCharacter}
                    onAddEnvironment={handleAddEnvironment}
                    onBatchAddEntities={handleBatchAddEntities}
                    onProceedToSeedance={() => setActiveTab('seedance')}
                    onBackToScript={() => setActiveTab('script')}
                    deductTokens={deductTokens}
                  />
                )}

                {/* STEP 3: Seedance 2.5 Multimodal Studio (5-Lane Blender) */}
                {activeTab === 'seedance' && (
                  <SeedanceMultimodalStudioTab
                    activeSeries={activeSeries}
                    activeEpisode={activeEpisode}
                    scenes={currentScenes}
                    characters={currentCharacters}
                    environments={currentEnvironments}
                    onUpdateScene={handleUpdateScene}
                    onProceedToSound={() => setActiveTab('sound')}
                    onProceedToTimeline={() => setActiveTab('sound')}
                    onBackToVault={() => setActiveTab('vault')}
                    deductTokens={deductTokens}
                  />
                )}

                {/* STEP 4: Sound & Voice Studio (Fish Audio Line-by-Line & Foley SFX) */}
                {activeTab === 'sound' && (
                  <SoundVoiceStudioTab
                    activeSeries={activeSeries}
                    activeEpisode={activeEpisode}
                    scenes={currentScenes}
                    characters={currentCharacters}
                    onUpdateScene={handleUpdateScene}
                    onProceedToTimeline={() => setActiveTab('timeline')}
                    onBackToSeedance={() => setActiveTab('seedance')}
                    deductTokens={deductTokens}
                  />
                )}

                {/* STEP 5: Timeline Compiler & Master */}
                {activeTab === 'timeline' && (
                  <TimelineCompilerTab
                    activeSeries={activeSeries}
                    activeEpisode={activeEpisode}
                    scenes={currentScenes}
                    characters={currentCharacters}
                    environments={currentEnvironments}
                    onUpdateEpisodeMasterVideo={handleUpdateEpisodeMasterVideo}
                    onSpawnSequel={() => handleSpawnSequel()}
                    onBackToSeedance={() => setActiveTab('sound')}
                    onBackToHome={() => setCurrentView('home')}
                    deductTokens={deductTokens}
                  />
                )}
              </>
            )}

          </div>
        )}

      </main>

      {/* Modals & Slide-overs */}
      <ProjectRouterModal
        isOpen={isProjectRouterOpen}
        onClose={() => setIsProjectRouterOpen(false)}
        walletBalance={user.wallet_balance}
        onProjectCreated={handleProjectCreated}
        initialRoute={modalInitialRoute}
        initialPreset={modalInitialPreset}
        onTopup={handleTopup}
      />

      <DatabaseArchitectureModal
        isOpen={isSchemaModalOpen}
        onClose={() => setIsSchemaModalOpen(false)}
      />

      <PythonOrchestrationModal
        isOpen={isPythonModalOpen}
        onClose={() => setIsPythonModalOpen(false)}
      />

      <WalletTopupModal
        isOpen={isTopupModalOpen}
        onClose={() => setIsTopupModalOpen(false)}
        currentBalance={user.wallet_balance}
        currentTier={user.subscription_tier}
        onTopup={handleTopup}
        onSubscribe={handleSubscribe}
      />

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300 font-['Cinzel',serif]">AI Manga Studio</span>
            <span>• Professional Continuity Engine</span>
          </div>
          <div className="flex items-center gap-4 font-mono text-[11px] text-slate-400">
            <span>Vercel Neon PostgreSQL</span>
            <span>•</span>
            <span>Volcano Engine Seedance 2.5</span>
            <span>•</span>
            <span>Qwen 2.5-VL Pro</span>
            <span>•</span>
            <span>Fish Speech Audio</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
