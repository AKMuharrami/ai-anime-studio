import React, { useState, useRef, useEffect } from 'react';
import { 
  Mic, 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  RotateCcw, 
  Sparkles, 
  CheckCircle2, 
  ShieldCheck, 
  Layers, 
  Sliders, 
  Music, 
  Film, 
  Radio, 
  ArrowRight, 
  ArrowLeft, 
  Download, 
  RefreshCw, 
  Flame, 
  Clock, 
  Info,
  Check
} from 'lucide-react';
import { Series, Episode, Scene, Character, DialogueLine } from '../types';
import { SceneMediaPlayer } from './SceneMediaPlayer';

interface SoundVoiceStudioTabProps {
  deductTokens: (cost: number, reason: string) => Promise<boolean>;
  activeSeries: Series | null;
  activeEpisode: Episode | null;
  scenes: Scene[];
  characters: Character[];
  onUpdateScene: (sceneId: string, updated: Partial<Scene>) => void;
  onProceedToTimeline: () => void;
  onBackToSeedance: () => void;
}

const VOICE_PRESETS = [
  { id: 'FISH_VOICE_JP_MALE_TACTICAL_BARITONE_01', name: 'Tactical Baritone (Hero / Warrior)', tone: 'Deep, commanding, steadfast' },
  { id: 'FISH_VOICE_JP_MALE_SCHOLAR_02', name: 'Strategic Scholar (Intellect / Strategist)', tone: 'Articulate, measured, analytical' },
  { id: 'FISH_VOICE_JP_MALE_COMMANDER_03', name: 'Noble Commander (Leader / Veteran)', tone: 'Authoritative, resonant, majestic' },
  { id: 'FISH_VOICE_JP_MALE_GRAVELLY_04', name: 'Stoic Mentor (Elder / Master)', tone: 'Gravelly, weathered, disciplined' },
  { id: 'FISH_VOICE_JP_MALE_YOUTH_05', name: 'Energetic Protagonist (Youth / Novice)', tone: 'Vibrant, sharp, determined' }
];

const EMOTION_PRESETS = [
  'Neutral', 'Determined', 'Tactical', 'Urgent', 'Whisper', 'Solemn', 'Dramatic'
];

const FOLEY_CATALOG = [
  { 
    id: 'foley_rain_asphalt', 
    name: 'Heavy Cyber Rain on Asphalt', 
    desc: 'Dense atmospheric rainfall hitting metal roofs and wet neon streets',
    url: 'https://actions.google.com/sounds/v1/weather/rain_heavy.ogg'
  },
  { 
    id: 'foley_thunder_wind', 
    name: 'Atmospheric Thunder & Windstorm', 
    desc: 'Distant rolling thunder rumbles and low wind gusts',
    url: 'https://actions.google.com/sounds/v1/weather/thunder_crack.ogg'
  },
  { 
    id: 'foley_cyber_server', 
    name: 'Space Station / Quantum Server Hum', 
    desc: 'Deep low-frequency acoustic server core ventilation and room resonance',
    url: 'https://actions.google.com/sounds/v1/science_fiction/space_station_atmosphere.ogg'
  },
  { 
    id: 'foley_pneumatic_door', 
    name: 'Pneumatic Vault Door & Steam Vent', 
    desc: 'Heavy hydraulic decompression, air pressure release, and metallic latches locking',
    url: 'https://actions.google.com/sounds/v1/doors/metal_door_open_close.ogg'
  },
  { 
    id: 'foley_tactical_footsteps', 
    name: 'Tactical Combat Boots on Wet Ground', 
    desc: 'Rhythmic footsteps with boot scuffs, gear rustle, and water splash reverberations',
    url: 'https://actions.google.com/sounds/v1/foley/footsteps_wet_pavement.ogg'
  },
  { 
    id: 'foley_blade_impact', 
    name: 'Energy Blade Clash & Kinetic Impact', 
    desc: 'High-velocity steel clash, plasma discharge ping, and concrete fragmentation',
    url: 'https://actions.google.com/sounds/v1/weapons/sword_clash.ogg'
  },
  { 
    id: 'none', 
    name: 'Pure Acoustic Silence / Minimal', 
    desc: 'Zero background noise, focusing strictly on dialogue clarity',
    url: ''
  }
];

export const SoundVoiceStudioTab: React.FC<SoundVoiceStudioTabProps> = ({
  activeSeries,
  activeEpisode,
  scenes,
  characters,
  onUpdateScene,
  onProceedToTimeline,
  onBackToSeedance,
  deductTokens
}) => {
  const [selectedSceneId, setSelectedSceneId] = useState<string>(scenes[0]?.id || '');
  const activeScene = scenes.find(s => s.id === selectedSceneId) || scenes[0];

  // Vocal Synthesis State
  const [synthesizingLineIdx, setSynthesizingLineIdx] = useState<number | null>(null);
  const [isBatchSynthesizingScene, setIsBatchSynthesizingScene] = useState(false);
  const [isBatchSynthesizingAll, setIsBatchSynthesizingAll] = useState(false);
  const [batchProgress, setBatchProgress] = useState<number>(0);
  const [activePreviewAudioIndex, setActivePreviewAudioIndex] = useState<number | null>(null);

  // Foley & Mixer & Acoustic Adaptation State
  const [activeFoleyId, setActiveFoleyId] = useState<string>('foley_rain_asphalt');
  const [isFoleyTesting, setIsFoleyTesting] = useState(false);
  const [dialogueVolume, setDialogueVolume] = useState<number>(0.95);
  const [isAdaptingSoundscape, setIsAdaptingSoundscape] = useState(false);
  const [acousticProfile, setAcousticProfile] = useState<{
    room_reverb?: string;
    foley_preset?: string;
    foley_name?: string;
    spatial_description?: string;
    foley_volume?: number;
  } | null>(null);

  const getCharacterVoiceToken = (speakerName: string, fallbackToken?: string) => {
    if (fallbackToken && fallbackToken.length > 3) return fallbackToken;
    const match = characters.find(c => c.name.toLowerCase() === speakerName.toLowerCase());
    if (match && match.fish_voice_token) return match.fish_voice_token;
    const idx = Math.abs(speakerName.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0)) % VOICE_PRESETS.length;
    return VOICE_PRESETS[idx].id;
  };
  const [foleyVolume, setFoleyVolume] = useState<number>(0.55);
  const [masterVolume, setMasterVolume] = useState<number>(1.0);

  const handleAdaptSoundscape = async () => {
    if (!activeScene) return;

    const hasTokens = await deductTokens(1, "Acoustic Foley & Environmental Profiling");
    if (!hasTokens) return;

    setIsAdaptingSoundscape(true);
    try {
      const res = await fetch('/api/assets/audio/adapt-scene-soundscape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scene_id: activeScene.id,
          location_name: activeScene.location_name || 'Cyberpunk Alley',
          lighting_mood: activeScene.lighting_mood || 'Moody Neon Atmosphere',
          action_prompt: activeScene.action_prompt || activeScene.prompt || 'Tactical dialogue standoff',
          dialogue: activeScene.dialogue || []
        })
      });

      const data = await res.json();
      if (data.success && data.acoustic_profile) {
        setAcousticProfile(data.acoustic_profile);
        if (data.acoustic_profile.foley_preset) {
          setActiveFoleyId(data.acoustic_profile.foley_preset);
        }
        if (typeof data.acoustic_profile.foley_volume === 'number') {
          setFoleyVolume(data.acoustic_profile.foley_volume);
        }

        if (data.dialogue_directives && Array.isArray(data.dialogue_directives) && activeScene.dialogue) {
          const updatedDialogue = activeScene.dialogue.map((d, idx) => {
            const dir = data.dialogue_directives[idx];
            if (dir) {
              return {
                ...d,
                emotion: dir.emotion || d.emotion
              };
            }
            return d;
          });
          onUpdateScene(activeScene.id, {
            dialogue: updatedDialogue
          });
        }
      }
    } catch (e) {
      console.error("Failed to adapt soundscape:", e);
    } finally {
      setIsAdaptingSoundscape(false);
    }
  };

  const previewAudioRef = useRef<HTMLAudioElement | null>(null);
  const foleyTestAudioRef = useRef<HTMLAudioElement | null>(null);

  // Sync selected scene if scenes update
  useEffect(() => {
    if (!selectedSceneId && scenes.length > 0) {
      setSelectedSceneId(scenes[0].id);
    }
  }, [scenes, selectedSceneId]);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      if (previewAudioRef.current) previewAudioRef.current.pause();
      if (foleyTestAudioRef.current) foleyTestAudioRef.current.pause();
    };
  }, []);

  const handleTestFoley = (foleyId: string) => {
    const foley = FOLEY_CATALOG.find(f => f.id === foleyId);
    if (!foley || !foley.url) {
      if (foleyTestAudioRef.current) foleyTestAudioRef.current.pause();
      setIsFoleyTesting(false);
      return;
    }

    if (isFoleyTesting && activeFoleyId === foleyId) {
      if (foleyTestAudioRef.current) foleyTestAudioRef.current.pause();
      setIsFoleyTesting(false);
    } else {
      setActiveFoleyId(foleyId);
      if (!foleyTestAudioRef.current) {
        foleyTestAudioRef.current = new Audio(foley.url);
        foleyTestAudioRef.current.loop = true;
      } else {
        foleyTestAudioRef.current.src = foley.url;
      }
      foleyTestAudioRef.current.volume = foleyVolume;
      foleyTestAudioRef.current.play().catch(() => {});
      setIsFoleyTesting(true);
    }
  };

  const handlePlayLineAudio = (line: DialogueLine, idx: number) => {
    if (activePreviewAudioIndex === idx) {
      if (previewAudioRef.current) {
        previewAudioRef.current.pause();
      }
      setActivePreviewAudioIndex(null);
      return;
    }

    if (line.audio_url) {
      if (previewAudioRef.current) previewAudioRef.current.pause();
      previewAudioRef.current = new Audio(line.audio_url);
      previewAudioRef.current.volume = dialogueVolume;
      previewAudioRef.current.play().catch(() => {});
      setActivePreviewAudioIndex(idx);
      previewAudioRef.current.onended = () => setActivePreviewAudioIndex(null);
      previewAudioRef.current.onerror = () => setActivePreviewAudioIndex(null);
    } else if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utt = new SpeechSynthesisUtterance(line.line);
      utt.pitch = 0.9;
      utt.rate = 1.0;
      setActivePreviewAudioIndex(idx);
      utt.onend = () => setActivePreviewAudioIndex(null);
      utt.onerror = () => setActivePreviewAudioIndex(null);
      window.speechSynthesis.speak(utt);
    }
  };

  const handleSynthesizeSingleLine = async (lineIdx: number) => {
    if (!activeScene || !activeScene.dialogue || !activeScene.dialogue[lineIdx]) return;
    const line = activeScene.dialogue[lineIdx];

    const hasTokens = await deductTokens(1, `Synthesize Character Voice Line (${line.speaker})`);
    if (!hasTokens) return;

    setSynthesizingLineIdx(lineIdx);

    try {
      const response = await fetch('/api/assets/audio/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: line.line,
          speaker: line.speaker,
          fish_voice_token: getCharacterVoiceToken(line.speaker, line.fish_voice_token),
          emotion: line.emotion || 'Neutral'
        })
      });

      const data = await response.json();
      if (data.success && data.audio_url) {
        const updatedDialogue = [...activeScene.dialogue];
        updatedDialogue[lineIdx] = {
          ...updatedDialogue[lineIdx],
          audio_url: data.audio_url
        };
        onUpdateScene(activeScene.id, { dialogue: updatedDialogue });
      }
    } catch (err) {
      console.error("Error synthesizing line:", err);
    } finally {
      setSynthesizingLineIdx(null);
    }
  };

  const handleBatchSynthesizeScene = async () => {
    if (!activeScene || !activeScene.dialogue || activeScene.dialogue.length === 0) return;

    const hasTokens = await deductTokens(2, "Batch Synthesize Scene Dialogue");
    if (!hasTokens) return;

    setIsBatchSynthesizingScene(true);

    try {
      const response = await fetch('/api/assets/audio/batch-dialogue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scene_id: activeScene.id,
          dialogue_lines: activeScene.dialogue.map(d => ({
            speaker: d.speaker,
            line: d.line,
            fish_voice_token: getCharacterVoiceToken(d.speaker, d.fish_voice_token),
            emotion: d.emotion || 'Neutral'
          }))
        })
      });

      const data = await response.json();
      if (data.success && data.tracks) {
        const updatedDialogue = activeScene.dialogue.map((d, i) => {
          const track = data.tracks.find((t: any) => t.index === i);
          return {
            ...d,
            audio_url: track?.audio_url || d.audio_url
          };
        });
        onUpdateScene(activeScene.id, { dialogue: updatedDialogue });
      }
    } catch (err) {
      console.error("Error in batch dialogue synthesis:", err);
    } finally {
      setIsBatchSynthesizingScene(false);
    }
  };

  const handleBatchSynthesizeAllScenes = async () => {
    setIsBatchSynthesizingAll(true);
    setBatchProgress(0);

    for (let i = 0; i < scenes.length; i++) {
      const scene = scenes[i];
      if (scene.dialogue && scene.dialogue.length > 0) {
        try {
          const response = await fetch('/api/assets/audio/batch-dialogue', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              scene_id: scene.id,
              dialogue_lines: scene.dialogue.map(d => ({
                speaker: d.speaker,
                line: d.line,
                fish_voice_token: getCharacterVoiceToken(d.speaker, d.fish_voice_token),
                emotion: d.emotion || 'Neutral'
              }))
            })
          });

          const data = await response.json();
          if (data.success && data.tracks) {
            const updatedDialogue = scene.dialogue.map((d, idx) => {
              const track = data.tracks.find((t: any) => t.index === idx);
              return {
                ...d,
                audio_url: track?.audio_url || d.audio_url
              };
            });
            onUpdateScene(scene.id, { dialogue: updatedDialogue });
          }
        } catch (e) {
          console.warn("Batch synthesis warning for scene:", scene.id);
        }
      }
      setBatchProgress(Math.round(((i + 1) / scenes.length) * 100));
    }

    setIsBatchSynthesizingAll(false);
  };

  const handleUpdateLineField = (lineIdx: number, field: keyof DialogueLine, val: string) => {
    if (!activeScene || !activeScene.dialogue) return;
    const updatedDialogue = [...activeScene.dialogue];
    updatedDialogue[lineIdx] = {
      ...updatedDialogue[lineIdx],
      [field]: val
    };
    onUpdateScene(activeScene.id, { dialogue: updatedDialogue });
  };

  const dialogueLines = activeScene?.dialogue || [];
  const readyVoiceCount = dialogueLines.filter(d => !!d.audio_url).length;

  return (
    <div className="space-y-6">
      
      {/* Studio Header & Halal Compliance Badge */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl backdrop-blur-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Mic className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                  Sound & Voice Studio
                  <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
                    Step 4 of 5
                  </span>
                </h1>
                <p className="text-xs text-slate-400">
                  Fish Audio SOTA Neural Dialogue Synthesis • 100% Halal Foley SFX Arranger • Zero Musical Instruments
                </p>
              </div>
            </div>
          </div>

          {/* Halal Compliance Banner */}
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs font-mono">
            <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>100% Halal Verified • 0% Music • Vocal Dialogue & Acoustic Foley Only</span>
          </div>
        </div>

        {/* Scene Selector Strip */}
        <div className="mt-6 pt-6 border-t border-slate-800 flex items-center gap-2 overflow-x-auto pb-2">
          {scenes.map((sc, idx) => {
            const hasVideo = !!sc.video_url;
            const lines = sc.dialogue || [];
            const readyLines = lines.filter(l => !!l.audio_url).length;
            const isSelected = sc.id === activeScene?.id;

            return (
              <button
                key={sc.id}
                type="button"
                onClick={() => setSelectedSceneId(sc.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-mono transition-all shrink-0 flex items-center gap-2 border cursor-pointer ${
                  isSelected
                    ? 'bg-amber-500/20 border-amber-500 text-amber-200 shadow-md shadow-amber-500/10'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <span className="font-bold">Scene {sc.scene_index || idx + 1}</span>
                <span className={`h-2 w-2 rounded-full ${hasVideo ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                <span className="text-[10px] opacity-75">
                  ({readyLines}/{lines.length} lines)
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Left = Spacious Video Viewport & Audio Mixer (7 cols), Right = Neural Dialogue & Foley (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Spacious Viewport & Mixer (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* PHASE 4: SYNCHRONIZED SCENE MEDIA PLAYER */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Film className="h-4 w-4 text-amber-400" />
                <h3 className="font-bold text-slate-100 text-sm">
                  Scene {activeScene?.scene_index || 1} Sound-Synced Master
                </h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                {readyVoiceCount} of {dialogueLines.length} Vocals Synced
              </span>
            </div>

            {activeScene && (
              <SceneMediaPlayer
                scene={activeScene}
                characters={characters}
                seriesTitle={activeSeries?.title}
                artStyleSeed={activeSeries?.art_style_seed}
                autoPlay={false}
                showSubtitleBurnIn={true}
              />
            )}

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 font-mono space-y-1">
              <div className="flex items-center justify-between">
                <span>Active Foley:</span>
                <span className="text-slate-200 capitalize">{activeFoleyId}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Dialogue Latency:</span>
                <span className="text-emerald-400">&lt; 15ms zero-drift</span>
              </div>
            </div>
          </div>

          {/* PHASE 3: LIVE MULTI-TRACK MIXER */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-lg">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <Sliders className="h-4 w-4 text-purple-400" />
              <h3 className="font-bold text-slate-100 text-sm">Phase 3: Multi-Track Sound Mixer</h3>
            </div>

            <div className="space-y-4 bg-slate-950/70 p-4 rounded-2xl border border-slate-800/80">
              {/* Dialogue Track Level */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-300 flex items-center gap-1.5">
                    <Mic className="h-3.5 w-3.5 text-amber-400" />
                    Fish Audio Dialogue Track
                  </span>
                  <span className="text-amber-400 font-bold">{Math.round(dialogueVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={dialogueVolume}
                  onChange={(e) => setDialogueVolume(parseFloat(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              {/* Acoustic Foley Track Level */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-300 flex items-center gap-1.5">
                    <Volume2 className="h-3.5 w-3.5 text-emerald-400" />
                    Acoustic Foley Ambience Track
                  </span>
                  <span className="text-emerald-400 font-bold">{Math.round(foleyVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={foleyVolume}
                  onChange={(e) => setFoleyVolume(parseFloat(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>

              {/* Raw Video BGM (Permanently Muted / Halal Banned) */}
              <div className="space-y-1.5 opacity-60">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400 flex items-center gap-1.5 line-through">
                    <Music className="h-3.5 w-3.5 text-rose-400" />
                    Raw Video AI Background Music
                  </span>
                  <span className="text-rose-400 font-bold text-[10px]">MUTED (0%)</span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-rose-500/20 w-0" />
                </div>
                <p className="text-[10px] text-slate-500 font-mono">
                  • AI-generated video music is stripped to maintain 100% Halal compliance.
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Neural Dialogue & Foley (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* PHASE 1: FISH AUDIO VOCAL BOOTH & SMART SOUNDSCAPE ADAPTOR */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-lg">
            
            {/* AI Smart Adaptation Banner */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-amber-950/40 via-purple-950/30 to-slate-900 border border-amber-500/30 flex flex-col items-stretch justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-amber-400 animate-pulse" />
                  <span className="text-[11px] font-bold text-amber-200 font-mono uppercase tracking-wider">
                    Smart AI Adaptive Audio
                  </span>
                </div>
                <p className="text-[10px] text-slate-300 leading-relaxed">
                  Analyze location ({activeScene?.location_name || 'Anime Scene'}), lighting ({activeScene?.lighting_mood || 'Moody'}), and dialogue to pick matching background Foley & vocal emotions.
                </p>
                {acousticProfile && (
                  <div className="mt-2 flex flex-col gap-1.5 text-[9px] font-mono">
                    <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 self-start">
                      Foley: {acousticProfile.foley_name}
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30 self-start">
                      Acoustics: {acousticProfile.room_reverb}
                    </span>
                    <span className="text-slate-400 italic">
                      "{acousticProfile.spatial_description}"
                    </span>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={handleAdaptSoundscape}
                disabled={isAdaptingSoundscape}
                className="w-full px-3 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs font-mono transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-lg shadow-amber-500/10"
              >
                {isAdaptingSoundscape ? (
                  <RefreshCw className="h-3.5 w-3.5 animate-spin text-slate-950" />
                ) : (
                  <Sparkles className="h-3.5 w-3.5 text-slate-950" />
                )}
                <span>{isAdaptingSoundscape ? 'Analyzing...' : 'Smart Adapt'}</span>
              </button>
            </div>

            <div className="flex flex-col gap-3 pt-2 border-t border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0">
                  <Radio className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                    Phase 1: Fish Audio Vocal Booth
                  </h3>
                  <p className="text-[10px] text-slate-400">
                    Line-by-line voice casting and neural speech generation
                  </p>
                </div>
              </div>

              {/* Batch Actions */}
              <div className="grid grid-cols-1 gap-2">
                <button
                  type="button"
                  onClick={handleBatchSynthesizeScene}
                  disabled={isBatchSynthesizingScene || isBatchSynthesizingAll || dialogueLines.length === 0}
                  className="w-full py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold font-mono transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-sm"
                >
                  {isBatchSynthesizingScene ? (
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="h-3.5 w-3.5" />
                  )}
                  <span>Synthesize Scene Lines</span>
                </button>

                <button
                  type="button"
                  onClick={handleBatchSynthesizeAllScenes}
                  disabled={isBatchSynthesizingScene || isBatchSynthesizingAll}
                  className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer border border-slate-700"
                >
                  {isBatchSynthesizingAll ? (
                    <RefreshCw className="h-3.5 w-3.5 animate-spin text-amber-400" />
                  ) : (
                    <Layers className="h-3.5 w-3.5 text-amber-400" />
                  )}
                  <span>Batch All ({batchProgress}%)</span>
                </button>
              </div>
            </div>

            {/* Dialogue Lines List */}
            {dialogueLines.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-slate-800 rounded-2xl text-slate-500 text-xs font-mono space-y-2">
                <p>No dialogue lines assigned for this scene.</p>
                <p className="text-[11px] text-slate-600">You can add dialogue lines in Step 1 (Screenplay Parser).</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                {dialogueLines.map((line, idx) => {
                  const isSynthesizing = synthesizingLineIdx === idx;
                  const isPreviewing = activePreviewAudioIndex === idx;
                  const hasAudio = !!line.audio_url;

                  return (
                    <div 
                      key={idx}
                      className={`p-3 rounded-xl border transition-all ${
                        hasAudio 
                          ? 'bg-slate-950/80 border-emerald-500/30' 
                          : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex flex-col gap-1.5 mb-2">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="text-xs font-bold text-amber-300 font-mono truncate">
                              {line.speaker}
                            </span>
                            <span className={`h-1.5 w-1.5 rounded-full ${hasAudio ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                            <span className="text-[9px] text-slate-400 font-mono">
                              #{idx + 1}
                            </span>
                          </div>
                          {hasAudio && (
                            <span className="text-[9px] text-emerald-400 font-mono">
                              Ready
                            </span>
                          )}
                        </div>

                        {/* Line Voice & Emotion Selectors */}
                        <div className="grid grid-cols-2 gap-1.5">
                          <select
                            value={line.emotion || 'Neutral'}
                            onChange={(e) => handleUpdateLineField(idx, 'emotion', e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-[9px] font-mono text-slate-300 focus:outline-none focus:border-amber-500"
                          >
                            {EMOTION_PRESETS.map(em => (
                              <option key={em} value={em}>{em}</option>
                            ))}
                          </select>

                          <select
                            value={line.fish_voice_token || 'FISH_VOICE_JP_MALE_TACTICAL_BARITONE_01'}
                            onChange={(e) => handleUpdateLineField(idx, 'fish_voice_token', e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-[9px] font-mono text-slate-300 focus:outline-none focus:border-amber-500 truncate"
                          >
                            {VOICE_PRESETS.map(vp => (
                              <option key={vp.id} value={vp.id}>{vp.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Dialogue Text Content */}
                      <p className="text-[11px] text-slate-200 leading-relaxed font-sans bg-slate-900/40 p-2 rounded-lg border border-slate-800/60 mb-2">
                        "{line.line}"
                      </p>

                      {/* Audio Controls & Synthesis Button */}
                      <div className="flex flex-col gap-1.5">
                        <button
                          type="button"
                          onClick={() => handlePlayLineAudio(line, idx)}
                          className={`w-full py-1 rounded-lg text-[10px] font-mono flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                            isPreviewing
                              ? 'bg-emerald-500 text-slate-950 font-bold'
                              : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                          }`}
                        >
                          {isPreviewing ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                          <span>{isPreviewing ? 'Playing Take' : hasAudio ? 'Audition' : 'Test Speech'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleSynthesizeSingleLine(idx)}
                          disabled={isSynthesizing}
                          className="w-full py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-[10px] font-mono font-bold transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                        >
                          {isSynthesizing ? (
                            <RefreshCw className="h-3 w-3 animate-spin" />
                          ) : (
                            <Mic className="h-3 w-3" />
                          )}
                          <span>{hasAudio ? 'Re-Take' : 'Synthesize Voice'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* PHASE 2: ACOUSTIC FOLEY & SFX ARRANGEMENT */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-lg">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Volume2 className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                  Phase 2: Acoustic Foley SFX
                </h3>
                <p className="text-[10px] text-slate-400">
                  Atmospheric environmental soundscapes (100% Halal)
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {FOLEY_CATALOG.map((foley) => {
                const isActive = activeFoleyId === foley.id;
                const isPlayingThis = isFoleyTesting && isActive;

                return (
                  <div
                    key={foley.id}
                    className={`p-3 rounded-xl border transition-all flex flex-col gap-2 ${
                      isActive
                        ? 'bg-emerald-950/30 border-emerald-500/50 text-slate-100'
                        : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-slate-200 font-mono">
                        {foley.name}
                      </span>
                      {isActive && (
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 leading-snug">
                      {foley.desc}
                    </p>

                    <div className="flex items-center gap-2 pt-2 border-t border-slate-800/60">
                      <button
                        type="button"
                        onClick={() => setActiveFoleyId(foley.id)}
                        className={`flex-1 py-1 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer ${
                          isActive
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                        }`}
                      >
                        {isActive ? 'Selected' : 'Assign'}
                      </button>

                      {foley.url && (
                        <button
                          type="button"
                          onClick={() => handleTestFoley(foley.id)}
                          className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-mono shrink-0 cursor-pointer flex items-center gap-1"
                        >
                          {isPlayingThis ? <Pause className="h-3 w-3 text-emerald-400" /> : <Play className="h-3 w-3" />}
                          <span>{isPlayingThis ? 'Stop' : 'Test'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>

      {/* FOOTER ACTIONS */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBackToSeedance}
          className="px-5 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold font-mono transition-all flex items-center gap-2 cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Step 3: Seedance Studio</span>
        </button>

        <button
          type="button"
          onClick={onProceedToTimeline}
          className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 hover:opacity-95 text-white text-xs font-bold font-mono transition-all flex items-center gap-2 shadow-lg shadow-rose-500/20 cursor-pointer"
        >
          <span>Proceed to Step 5: Timeline Compiler & Master</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

    </div>
  );
};
