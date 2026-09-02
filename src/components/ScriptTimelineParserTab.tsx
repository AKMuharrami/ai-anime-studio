import React, { useState } from 'react';
import { 
  FileText, 
  Sparkles, 
  MapPin, 
  Users, 
  Clock, 
  Video, 
  ArrowRight, 
  Check, 
  RefreshCw, 
  Plus, 
  Trash2, 
  MessageSquare,
  Camera,
  Film,
  Zap,
  Sliders,
  CheckCircle2,
  Layers,
  Wand2
} from 'lucide-react';
import { Episode, Series, ScriptSceneData, ScreenplayData, Character, Environment } from '../types';

interface ScriptTimelineParserTabProps {
  deductTokens: (cost: number, reason: string) => Promise<boolean>;
  activeEpisode: Episode | null;
  activeSeries: Series | null;
  onUpdateEpisodeScript: (scriptData: ScreenplayData) => void;
  onProceedToVault: () => void;
  onBatchAddEntities?: (characters: Character[], environments: Environment[]) => void;
}

export const ScriptTimelineParserTab: React.FC<ScriptTimelineParserTabProps> = ({
  activeEpisode,
  activeSeries,
  onUpdateEpisodeScript,
  onProceedToVault,
  onBatchAddEntities,
  deductTokens
}) => {
    const [plotInput, setPlotInput] = useState(
    activeEpisode?.full_script_json?.synopsis || ''
  );
  const [sceneCountTarget, setSceneCountTarget] = useState<number>(6);
  const [isParsing, setIsParsing] = useState(false);
  const [isGeneratingNextScene, setIsGeneratingNextScene] = useState(false);
  const [isSyncingEntities, setIsSyncingEntities] = useState(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState<string | null>(null);

  const [scriptData, setScriptData] = useState<ScreenplayData>(
    activeEpisode?.full_script_json || {
      logline: 'When an unregistered neural resonance frequency spikes in Sector 4, Detective Ren tracks the rogue signal directly to tactical commander Tariq Al-Mansoor.',
      synopsis: 'A high-stakes cyber-noir investigation into classified memory records.',
      target_runtime_minutes: activeEpisode?.route === 'FULL_EPISODE' ? 20.0 : 2.5,
      route: activeEpisode?.route || 'FULL_EPISODE',
      scenes: []
    }
  );

  const samplePresets = [
    {
      label: 'Cyber-Soul Infiltration (6-Scene Arc)',
      route: 'FULL_EPISODE',
      sceneCount: 6,
      prompt: 'In Neo-Kyoto 2099, Detective Ren investigates illegal neural ether extraction in Sector 4. Zayd and Archivist Vorn defend the central cryo-vault to preserve classified souls. Enforcer Kage intercepts them on the skyscraper helipad before a dawn override.'
    },
    {
      label: 'Glacial Citadel Siege (8-Scene Epic)',
      route: 'FULL_EPISODE',
      sceneCount: 8,
      prompt: 'Lord Kaelen and the Frostguard defend the Crystalline Citadel against an ancient frost titan awakened by forbidden rune alchemy. Multiple tactical stages unfold from the glacial gates to the celestial throne room.'
    },
    {
      label: 'High-Impact Speed Chase (4-Scene Short)',
      route: 'SHORT_FORM',
      sceneCount: 4,
      prompt: 'A 90-second ultra-fast hoverbike pursuit through holographic neon tunnels with kinetic drift turns, energy blade deflects, and a high-speed rooftop jump.'
    }
  ];

  // Detect unique characters and locations from current screenplay scenes
  const detectedCharacters: string[] = Array.from(
    new Set<string>(scriptData.scenes.flatMap(s => s.characters_present || []).filter(Boolean))
  );
  const detectedLocations: string[] = Array.from(
    new Set<string>(scriptData.scenes.map(s => s.location_name).filter(Boolean))
  );

  const handleParseScript = async () => {
    if (!plotInput.trim()) return;
    setIsParsing(true);
    setSyncStatusMsg(null);

    try {
      const response = await fetch('/api/scripts/breakdown', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plot_prompt: plotInput,
          route: activeEpisode?.route || 'FULL_EPISODE',
          series_title: activeSeries?.title || 'Anime Series',
          art_style_seed: activeSeries?.art_style_seed || 'MAPPA_VIBRANT_CYBERPUNK_4K',
          scene_count: sceneCountTarget
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.screenplay) {
          setScriptData(data.screenplay);
          onUpdateEpisodeScript(data.screenplay);
          return;
        }
      }

      fallbackBreakdown();
    } catch (err: any) {
      console.warn("Script breakdown fallback activated:", err.message);
      fallbackBreakdown();
    } finally {
      setIsParsing(false);
    }
  };

  const fallbackBreakdown = () => {
    const isFull = (activeEpisode?.route || 'FULL_EPISODE') === 'FULL_EPISODE';
    const fallbackScript: ScreenplayData = {
      logline: `High-stakes narrative arc in ${activeSeries?.title || 'Neo-Kyoto'}.`,
      synopsis: plotInput,
      target_runtime_minutes: isFull ? 20.0 : 2.5,
      route: activeEpisode?.route || 'FULL_EPISODE',
      scenes: [
        {
          scene_index: 1,
          location_name: 'Grand Data Archive Entrance',
          characters_present: ['Tariq'],
          action_prompt: 'High-contrast architectural layout. Tariq walks through the majestic gates, wearing modest long coats and observing the ancient mechanisms.',
          camera_action: 'Low-angle tracking crane shot moving forward at 24fps with cinematic depth of field',
          estimated_duration: isFull ? 45 : 8,
          dialogue: [
            { speaker: 'Tariq', line: 'The frequency is bleeding through the subnet. He is close.', emotion: 'Gravely serious' }
          ]
        },
        {
          scene_index: 2,
          location_name: 'Historical Repository Mainframe',
          characters_present: ['Tariq', 'Zayd'],
          action_prompt: 'Tariq enters the repository. Zayd turns, adjusting his modest tactical jacket, organizing the illuminated data scrolls.',
          camera_action: 'Dual medium over-the-shoulder cuts, whipping 180-degree camera arc',
          estimated_duration: isFull ? 50 : 10,
          dialogue: [
            { speaker: 'Zayd', line: 'Hold your position, Detective. These memory archives hold records corporate enforcers tried to erase.', emotion: 'Commanding baritone' },
            { speaker: 'Tariq', line: 'I know enough. You broke three firewalls to protect a classified soul.', emotion: 'Tactical' }
          ]
        },
        {
          scene_index: 3,
          location_name: 'Historical Repository Mainframe',
          characters_present: ['Tariq', 'Zayd'],
          action_prompt: 'Ceiling klaxons flash crimson as defense turrets deploy. Ren and Tariq simultaneously draw weapons in a back-to-back tactical stance.',
          camera_action: 'Dynamic 360-degree orbital rotation with anime speed lines',
          estimated_duration: isFull ? 55 : 8,
          dialogue: [
            { speaker: 'Zayd', line: 'Aethel Corps deployed combat droids. We neutralize them together!', emotion: 'Adrenaline rush' }
          ]
        },
        {
          scene_index: 4,
          location_name: 'Under-Grid Cipher Lounge',
          characters_present: ['Tariq', 'Archivist Vorn', 'Zayd'],
          action_prompt: 'Taking refuge in an underground neon cipher den, Archivist Vorn decrypts the memory core on a holographic table.',
          camera_action: 'Slow orbital push in with holographic UI particles floating in foreground',
          estimated_duration: isFull ? 45 : 8,
          dialogue: [
            { speaker: 'Archivist Vorn', line: 'This neural encryption key belongs to the High Directorate.', emotion: 'Grave whisper' }
          ]
        },
        {
          scene_index: 5,
          location_name: 'Aethel Tower Helipad Overlook',
          characters_present: ['Tariq', 'Zayd', 'Enforcer Kage'],
          action_prompt: 'Bursting onto the rooftop in a torrential storm, Enforcer Kage intercepts them with a plasma blade as lightning strikes.',
          camera_action: 'Extreme wide dynamic crane shot pulling up into the stormy sky',
          estimated_duration: isFull ? 55 : 10,
          dialogue: [
            { speaker: 'Enforcer Kage', line: 'Your investigation ends on this roof, Detective!', emotion: 'Fierce' }
          ]
        },
        {
          scene_index: 6,
          location_name: 'Orbital Uplink Spire Pinnacle',
          characters_present: ['Tariq', 'Zayd'],
          action_prompt: 'With Enforcer Kage disarmed, Ren inserts the decrypted key into the broadcasting terminal as sunrise breaks through the clouds.',
          camera_action: 'Epic panoramic pull-back revealing dawn glowing across the skyline',
          estimated_duration: isFull ? 50 : 8,
          dialogue: [
            { speaker: 'Tariq', line: 'The broadcast is live. The city will remember everything.', emotion: 'Triumphant' }
          ]
        }
      ]
    };
    setScriptData(fallbackScript);
    onUpdateEpisodeScript(fallbackScript);
  };

  const handleGenerateNextScene = async () => {
    setIsGeneratingNextScene(true);
    try {
      const response = await fetch('/api/scripts/generate-next-scene', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          existing_scenes: scriptData.scenes,
          plot_synopsis: plotInput,
          series_title: activeSeries?.title,
          route: activeEpisode?.route
        })
      });

      const data = await response.json();
      if (data.success && data.scene) {
        const updatedScenes = [...scriptData.scenes, data.scene];
        const updatedScript = { ...scriptData, scenes: updatedScenes };
        setScriptData(updatedScript);
        onUpdateEpisodeScript(updatedScript);
      }
    } catch (err) {
      console.error("Error generating next scene:", err);
    } finally {
      setIsGeneratingNextScene(false);
    }
  };

  const handleBatchSyncEntities = async () => {
    if (!onBatchAddEntities || scriptData.scenes.length === 0) return;
    setIsSyncingEntities(true);
    setSyncStatusMsg(null);

    try {
      const response = await fetch('/api/assets/cast-extractor/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenes: scriptData.scenes,
          series_id: activeSeries?.id || 'ser_cyber_aethel',
          art_style_seed: activeSeries?.art_style_seed || 'MAPPA_VIBRANT_CYBERPUNK_CELL_4K'
        })
      });

      const data = await response.json();
      if (data.success) {
        onBatchAddEntities(data.characters, data.environments);
        setSyncStatusMsg(`Successfully provisioned ${data.stats.characters_count} Characters & ${data.stats.environments_count} Environments to Vault!`);
      }
    } catch (err: any) {
      console.error("Batch sync error:", err);
      setSyncStatusMsg("Error syncing entities. Check console.");
    } finally {
      setIsSyncingEntities(false);
    }
  };

  const handleUpdateScene = (index: number, updatedScene: ScriptSceneData) => {
    const newScenes = [...scriptData.scenes];
    newScenes[index] = updatedScene;
    const newScript = { ...scriptData, scenes: newScenes };
    setScriptData(newScript);
    onUpdateEpisodeScript(newScript);
  };

  const handleAddScene = () => {
    const newIndex = scriptData.scenes.length + 1;
    const newScene: ScriptSceneData = {
      scene_index: newIndex,
      location_name: detectedLocations[0] || 'Grand Data Archive Entrance',
      characters_present: detectedCharacters.length > 0 ? [detectedCharacters[0]] : ['Tariq'],
      action_prompt: 'Continuous cinematic tracking shot as characters advance into the new sector.',
      camera_action: 'Slow anime crane push with ambient lens flare',
      estimated_duration: activeEpisode?.route === 'FULL_EPISODE' ? 45 : 8,
      dialogue: [
        { speaker: detectedCharacters[0] || 'Tariq', line: 'Keep your guard up. We are crossing the perimeter.', emotion: 'Tactical' }
      ]
    };
    const newScenes = [...scriptData.scenes, newScene];
    const newScript = { ...scriptData, scenes: newScenes };
    setScriptData(newScript);
    onUpdateEpisodeScript(newScript);
  };

  const handleDeleteScene = (index: number) => {
    const newScenes = scriptData.scenes.filter((_, i) => i !== index).map((s, idx) => ({
      ...s,
      scene_index: idx + 1
    }));
    const newScript = { ...scriptData, scenes: newScenes };
    setScriptData(newScript);
    onUpdateEpisodeScript(newScript);
  };

  const totalRuntimeSeconds = scriptData.scenes.reduce((acc, s) => acc + (s.estimated_duration || 0), 0);

  return (
    <div className="space-y-6">
      
      {/* Top Banner / Pipeline Context */}
      <div className="bg-gradient-to-r from-rose-950/40 via-slate-900 to-slate-900 border border-rose-500/20 rounded-2xl p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 text-[11px] font-bold rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                STEP 1: MULTI-SCENE SCRIPT & TIMELINE PARSER
              </span>
              <span className="text-xs font-mono text-slate-400">
                DeepSeek-R1 / Gemini Pro Screenplay Engine
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-100 font-['Cinzel',serif]">
              Screenplay Multi-Scene Decomposition & Cast Extractor
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Parses the anime narrative into a complete sequence of master scene blocks (30–60s each). Automatically extracts recurring male character cast and environmental settings for batch model sheet generation and Seedance 2.5 video rendering.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right">
              <div className="text-[11px] text-slate-400">Total Episode Timeline:</div>
              <div className="text-sm font-mono font-bold text-rose-400">
                {Math.floor(totalRuntimeSeconds / 60)}m {totalRuntimeSeconds % 60}s ({scriptData.scenes.length} Scenes)
              </div>
            </div>

            <button
              onClick={onProceedToVault}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 transition-all cursor-pointer"
            >
              <span>Step 2: Studio Design Vault</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Screenplay Input Box & AI Breakdown Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-200">
            <FileText className="h-4 w-4 text-rose-400" />
            <span>Episode Plot Prompt & Narrative Outline</span>
          </div>

          {/* Quick Presets */}
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <span className="text-[11px] text-slate-500 mr-1 hidden sm:inline">Presets:</span>
            {samplePresets.map((p, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setPlotInput(p.prompt);
                  setSceneCountTarget(p.sceneCount);
                }}
                className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 border border-slate-700 hover:border-slate-600 transition-colors whitespace-nowrap"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <textarea
          rows={4}
          value={plotInput}
          onChange={(e) => setPlotInput(e.target.value)}
          placeholder="Enter the episode script, character confrontations, or high-level narrative plot..."
          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs text-slate-100 focus:outline-none focus:border-rose-500 font-sans leading-relaxed"
        />

        {/* Scene Count Multiplier & Generation Controls */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pt-2 border-t border-slate-800/80">
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-purple-400" />
              <span>Target Scenes:</span>
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
                {[4, 6, 8, 10].map((count) => (
                  <button
                    key={count}
                    onClick={() => setSceneCountTarget(count)}
                    className={`px-2.5 py-0.5 rounded text-[11px] font-bold transition-all ${
                      sceneCountTarget === count
                        ? 'bg-rose-600 text-white shadow'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {count} Scenes
                  </button>
                ))}
              </div>
            </div>

            <div className="hidden sm:inline text-slate-600">|</div>
            <span className="text-[11px]">
              Route: <strong className="text-slate-200">{activeEpisode?.route || 'FULL_EPISODE'}</strong> (30-60s per block)
            </span>
          </div>

          <button
            onClick={handleParseScript}
            disabled={isParsing || !plotInput.trim()}
            className="w-full md:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30 transition-all disabled:opacity-50 cursor-pointer"
          >
            {isParsing ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Deconstructing {sceneCountTarget}-Scene Master Arc...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <span>Parse & Generate {sceneCountTarget}-Scene Screenplay Arc</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Smart Cast & Character Smart Identifier Widget */}
      {scriptData.scenes.length > 0 && (
        <div className="bg-gradient-to-r from-purple-950/30 via-slate-900 to-slate-900 border border-purple-500/30 rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  SCREENPLAY CHARACTER & CAST SMART IDENTIFIER
                </span>
                <span className="text-xs text-slate-400 font-mono">Real-Time Entity Analyzer</span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Identified <strong className="text-purple-300">{detectedCharacters.length} Male Characters</strong> and <strong className="text-sky-300">{detectedLocations.length} 4K Environments</strong> across {scriptData.scenes.length} master scenes.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleBatchSyncEntities}
                disabled={isSyncingEntities}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-xs font-bold shadow-md shadow-purple-600/20 transition-all shrink-0 cursor-pointer disabled:opacity-50"
              >
                {isSyncingEntities ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    <span>Provisioning Cast to Vault...</span>
                  </>
                ) : (
                  <>
                    <Zap className="h-3.5 w-3.5 text-yellow-300" />
                    <span>⚡ Auto-Provision Cast & Keyframes to Vault</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Identified Characters Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
            {detectedCharacters.map((charName) => {
              // Calculate scenes where character appears
              const scenesAppeared = scriptData.scenes
                .filter(s => s.characters_present?.includes(charName))
                .map(s => s.scene_index);
              // Calculate dialogue lines count
              const dialogueCount = scriptData.scenes.reduce((acc, s) => {
                return acc + (s.dialogue?.filter(d => d.speaker?.toLowerCase() === charName.toLowerCase())?.length || 0);
              }, 0);

              return (
                <div
                  key={charName}
                  className="bg-slate-950/70 border border-purple-500/30 hover:border-purple-400/60 rounded-xl p-3 flex flex-col justify-between gap-2 transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500/20 to-sky-500/20 border border-purple-400/40 text-purple-300 flex items-center justify-center font-bold text-xs shrink-0">
                        {charName.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-slate-100 truncate">{charName}</h4>
                        <span className="text-[10px] font-mono text-purple-400">
                          {dialogueCount > 0 ? `${dialogueCount} Spoken Lines` : 'Action/Presence Only'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-2 border-t border-slate-900">
                    <div className="flex items-center gap-1">
                      <span>Scenes:</span>
                      <div className="flex items-center gap-1">
                        {scenesAppeared.map(sNum => (
                          <span key={sNum} className="px-1.5 py-0.2 bg-slate-800 text-slate-300 rounded font-bold">
                            #{sNum}
                          </span>
                        ))}
                      </div>
                    </div>
                    <span className="text-emerald-400 flex items-center gap-0.5">
                      <CheckCircle2 className="h-3 w-3" /> Auto-Tracked
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {syncStatusMsg && (
            <div className="text-xs px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{syncStatusMsg}</span>
            </div>
          )}
        </div>
      )}

      {/* Screenplay Metadata Banner */}
      {scriptData.logline && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-1.5 text-xs">
          <div>
            <span className="font-semibold text-rose-400">Logline: </span>
            <span className="text-slate-200">{scriptData.logline}</span>
          </div>
          <div>
            <span className="font-semibold text-purple-400">Synopsis: </span>
            <span className="text-slate-300">{scriptData.synopsis}</span>
          </div>
        </div>
      )}

      {/* Structured Scene Blocks List */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-200">
            <Film className="h-4 w-4 text-purple-400" />
            <span>Master Scene Timeline Blocks ({scriptData.scenes.length} Scenes)</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleGenerateNextScene}
              disabled={isGeneratingNextScene || scriptData.scenes.length === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-300 text-xs font-semibold border border-slate-700 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isGeneratingNextScene ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  <span>Expanding Story...</span>
                </>
              ) : (
                <>
                  <Wand2 className="h-3.5 w-3.5" />
                  <span>+ Smart Generate Next Scene</span>
                </>
              )}
            </button>

            <button
              onClick={handleAddScene}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Custom Scene</span>
            </button>
          </div>
        </div>

        {scriptData.scenes.length === 0 ? (
          <div className="text-center py-12 bg-slate-900/40 border border-slate-800 rounded-2xl">
            <FileText className="h-10 w-10 text-slate-600 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-300">No scenes parsed yet</p>
            <p className="text-xs text-slate-500 mt-1">Click "Parse & Generate {sceneCountTarget}-Scene Screenplay Arc" to generate 30-60s master scenes.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {scriptData.scenes.map((scene, idx) => (
              <div
                key={idx}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 space-y-4 transition-all shadow-md"
              >
                {/* Scene Header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-rose-500/20 border border-rose-500/30 flex items-center justify-center font-mono font-bold text-rose-300 text-xs">
                      #{scene.scene_index}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5 text-sky-400" />
                        <input
                          type="text"
                          value={scene.location_name}
                          onChange={(e) => handleUpdateScene(idx, { ...scene, location_name: e.target.value })}
                          className="bg-slate-950 border border-slate-800 focus:border-sky-500 rounded px-2 py-1 text-xs font-bold text-sky-300 focus:outline-none"
                          placeholder="Location name..."
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Estimated Duration Control */}
                    <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs">
                      <Clock className="h-3.5 w-3.5 text-amber-400" />
                      <input
                        type="number"
                        min="5"
                        max="180"
                        value={scene.estimated_duration}
                        onChange={(e) => handleUpdateScene(idx, { ...scene, estimated_duration: parseFloat(e.target.value) || 30 })}
                        className="w-12 bg-transparent text-slate-100 font-mono font-bold focus:outline-none text-right"
                      />
                      <span className="text-slate-500">sec</span>
                    </div>

                    <button
                      onClick={() => handleDeleteScene(idx)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors cursor-pointer"
                      title="Delete Scene"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Extracted Entities: Characters Present */}
                <div className="flex items-center gap-2 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                  <Users className="h-4 w-4 text-purple-400 shrink-0" />
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Characters Present:
                  </span>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {scene.characters_present.map((charName, cIdx) => (
                      <span
                        key={cIdx}
                        className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[11px] font-medium"
                      >
                        👤 {charName}
                      </span>
                    ))}
                    <button
                      onClick={() => {
                        const newName = prompt("Enter character name to add to scene:");
                        if (newName) {
                          handleUpdateScene(idx, {
                            ...scene,
                            characters_present: [...scene.characters_present, newName]
                          });
                        }
                      }}
                      className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 hover:text-slate-200 text-[10px] cursor-pointer"
                    >
                      + Add Actor
                    </button>
                  </div>
                </div>

                {/* Action Prompt (Direct input for Seedance 2.5) */}
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Seedance 2.5 Action Prompt (Camera Movement + Physical Actions Only)
                  </label>
                  <textarea
                    rows={2}
                    value={scene.action_prompt}
                    onChange={(e) => handleUpdateScene(idx, { ...scene, action_prompt: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-rose-500"
                    placeholder="Describe character motion, camera angles, lighting shifts..."
                  />
                </div>

                {/* Camera Staging & Dialogue lines */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
                      <Camera className="h-3.5 w-3.5 text-sky-400" />
                      <span>Camera Action & Staging</span>
                    </label>
                    <input
                      type="text"
                      value={scene.camera_action}
                      onChange={(e) => handleUpdateScene(idx, { ...scene, camera_action: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
                      <MessageSquare className="h-3.5 w-3.5 text-emerald-400" />
                      <span>Scene Dialogue (Fish Speech Voice Sync)</span>
                    </label>
                    {scene.dialogue.length > 0 ? (
                      <div className="space-y-1 max-h-20 overflow-y-auto pr-1">
                        {scene.dialogue.map((d, dIdx) => (
                          <div key={dIdx} className="text-[11px] bg-slate-950 px-2 py-1 rounded border border-slate-800/80">
                            <span className="font-bold text-emerald-400">{d.speaker}: </span>
                            <span className="text-slate-300">"{d.line}"</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[11px] text-slate-500 italic py-1">No spoken lines (Action / Ambient Scene)</p>
                    )}
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Action Footer */}
      <div className="sticky bottom-4 z-20 bg-slate-950/95 backdrop-blur-md border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xl">
        <div className="text-xs text-slate-300">
          {scriptData.scenes.length > 0 ? (
            <>✅ <strong className="text-emerald-400">{scriptData.scenes.length} Master Scenes</strong> parsed and structured for Seedance 2.5 integration.</>
          ) : (
            <span className="text-slate-400">Parse a plot above or proceed directly with default master scene templates.</span>
          )}
        </div>
        <button
          onClick={onProceedToVault}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 hover:from-purple-500 hover:to-rose-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 transition-all cursor-pointer"
        >
          <span>{scriptData.scenes.length > 0 ? 'Proceed to Step 2: Studio Design Vault' : 'Proceed to Step 2: Design Vault'}</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

    </div>
  );
};
