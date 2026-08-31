import React, { useState } from 'react';
import { 
  Sparkles, 
  MapPin, 
  User, 
  Mic, 
  Image as ImageIcon, 
  ArrowRight, 
  ArrowLeft,
  Plus, 
  RefreshCw, 
  CheckCircle2, 
  Volume2, 
  Layers, 
  Grid, 
  Eye, 
  ShieldCheck, 
  ShieldAlert,
  AlertCircle,
  ExternalLink,
  Play,
  Pause,
  Sliders,
  Wand2,
  Edit3,
  Zap,
  X
} from 'lucide-react';
import { Character, Environment, Series, Episode, Scene } from '../types';

interface StudioDesignVaultTabProps {
  deductTokens: (cost: number, reason: string) => Promise<boolean>;
  activeSeries: Series | null;
  activeEpisode: Episode | null;
  characters: Character[];
  environments: Environment[];
  scenes: Scene[];
  onAddCharacter: (character: Character) => void;
  onAddEnvironment: (environment: Environment) => void;
  onBatchAddEntities?: (characters: Character[], environments: Environment[]) => void;
  onProceedToSeedance: () => void;
  onBackToScript?: () => void;
}

export const StudioDesignVaultTab: React.FC<StudioDesignVaultTabProps> = ({
  activeSeries,
  activeEpisode,
  characters,
  environments,
  scenes,
  onAddCharacter,
  onAddEnvironment,
  onBatchAddEntities,
  onProceedToSeedance,
  onBackToScript,
  deductTokens
}) => {
  const [subTab, setSubTab] = useState<'environments' | 'characters' | 'audio'>('characters');
  const [selectedEnv, setSelectedEnv] = useState<Environment | null>(environments[0] || null);
  const [selectedChar, setSelectedChar] = useState<Character | null>(characters[0] || null);
  const [isBatchSyncing, setIsBatchSyncing] = useState(false);
  const [batchSyncMsg, setBatchSyncMsg] = useState<string | null>(null);

  // Character Reference Quality Scanner & Auto-Enhancer States
  const [enhancingCharId, setEnhancingCharId] = useState<string | null>(null);
  const [isBatchEnhancing, setIsBatchEnhancing] = useState(false);
  const [enhanceProgressMsg, setEnhanceProgressMsg] = useState<string | null>(null);

  // Check if a character reference is insufficient (stock placeholder or short descriptor)
  const isCharReferenceInsufficient = (char: Character): boolean => {
    const url = char.turnaround_url || char.reference_images?.[0] || char.master_model_sheet_url || '';
    const desc = char.visual_descriptor || '';
    const isPlaceholder = !url || url.includes('images.unsplash.com') || url.includes('placeholder') || !url.startsWith('http');
    const isVague = desc.length < 80;
    return isPlaceholder || isVague || !char.is_enhanced;
  };

  // Enhance a single character's reference turnaround sheet
  const handleAutoEnhanceCharacter = async (char: Character) => {
    setEnhancingCharId(char.id);
    setEnhanceProgressMsg(`Synthesizing 4-angle turnaround blueprint for "${char.name}"...`);
    try {
      const res = await fetch('/api/assets/characters/auto-enhance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          character: char,
          series_title: activeSeries?.title,
          world_setting: activeSeries?.global_lore,
          art_style_seed: activeSeries?.art_style_seed || 'MAPPA_DARK_FANTASY_CYBER',
          is_manga: false
        })
      });
      const data = await res.json();
      if (data.success && data.character) {
        onAddCharacter(data.character);
        setSelectedChar(data.character);
        setEnhanceProgressMsg(`✨ "${char.name}" turnaround successfully locked with 4-angle model sheet!`);
        setTimeout(() => setEnhanceProgressMsg(null), 3500);
      }
    } catch (err) {
      console.error("Auto enhance error:", err);
      setEnhanceProgressMsg(`Failed to auto-enhance ${char.name}`);
    } finally {
      setEnhancingCharId(null);
    }
  };

  // Batch enhance all insufficient characters in the project
  const handleBatchAutoEnhanceAll = async () => {
    setIsBatchEnhancing(true);
    setEnhanceProgressMsg("Scanning project characters for placeholder/insufficient references...");
    try {
      const res = await fetch('/api/assets/characters/batch-auto-enhance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          characters,
          series_title: activeSeries?.title,
          world_setting: activeSeries?.global_lore,
          art_style_seed: activeSeries?.art_style_seed || 'MAPPA_DARK_FANTASY_CYBER',
          is_manga: false
        })
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.characters)) {
        data.characters.forEach((c: Character) => {
          if (c.is_enhanced) onAddCharacter(c);
        });
        if (selectedChar) {
          const updated = data.characters.find((c: Character) => c.id === selectedChar.id);
          if (updated) setSelectedChar(updated);
        }
        setEnhanceProgressMsg(`✨ Batch upgrade complete! Enhanced ${data.enhanced_count} character turnaround sheets.`);
        setTimeout(() => setEnhanceProgressMsg(null), 4000);
      }
    } catch (err) {
      console.error("Batch auto enhance error:", err);
      setEnhanceProgressMsg("Batch auto-enhancement encountered an issue.");
    } finally {
      setIsBatchEnhancing(false);
    }
  };
  
  // Qwen Image-Edit State (Newest Qwen 2.5VL Pro via ApiFrame)
  const [showQwenEditModal, setShowQwenEditModal] = useState(false);
  const [qwenSourceImage, setQwenSourceImage] = useState('');
  const [qwenEditPrompt, setQwenEditPrompt] = useState('');
  const [qwenStrength, setQwenStrength] = useState(0.80);
  const [isQwenEditing, setIsQwenEditing] = useState(false);
  const [qwenEditResult, setQwenEditResult] = useState<any>(null);
  const [qwenTargetType, setQwenTargetType] = useState<'character' | 'environment' | 'angle'>('character');

  const openQwenEdit = (imageUrl: string, targetType: 'character' | 'environment' | 'angle', defaultPrompt = '') => {
    setQwenSourceImage(imageUrl);
    setQwenTargetType(targetType);
    setQwenEditPrompt(defaultPrompt || (targetType === 'character' ? 'Add tactical combat armor with cyan fiber optic seams and holographic eye visor' : 'Adjust lighting to dark atmospheric twilight with volumetric cyan fog'));
    setQwenEditResult(null);
    setShowQwenEditModal(true);
  };

  const handleRunQwenImageEdit = async () => {
    if (!qwenEditPrompt || !qwenSourceImage) return;
    setIsQwenEditing(true);
    setQwenEditResult(null);

    try {
      const response = await fetch('/api/assets/qwen-image-edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source_image_url: qwenSourceImage,
          edit_prompt: qwenEditPrompt,
          strength: qwenStrength,
          character_id: selectedChar?.id,
          environment_id: selectedEnv?.id
        })
      });

      const data = await response.json();
      if (data.success && data.edited_image_url) {
        setQwenEditResult(data);

        // Apply immediately to current selected asset
        if (qwenTargetType === 'character' && selectedChar) {
          const updatedChar: Character = {
            ...selectedChar,
            turnaround_url: data.edited_image_url,
            master_model_sheet_url: data.edited_image_url,
            reference_images: [data.edited_image_url, ...selectedChar.reference_images.slice(1)]
          };
          setSelectedChar(updatedChar);
          onAddCharacter(updatedChar);
        } else if (qwenTargetType === 'environment' && selectedEnv) {
          const updatedEnv: Environment = {
            ...selectedEnv,
            master_keyframe_url: data.edited_image_url
          };
          setSelectedEnv(updatedEnv);
          onAddEnvironment(updatedEnv);
        }
      }
    } catch (err) {
      console.error("Error executing Qwen Image-Edit:", err);
    } finally {
      setIsQwenEditing(false);
    }
  };

  // Environment Generation State
  const [isGeneratingEnv, setIsGeneratingEnv] = useState(false);
  const [newEnvLocation, setNewEnvLocation] = useState('Neo-Tokyo Orbital Skyport');
  const [newEnvStyle, setNewEnvStyle] = useState('4K Anime cinematic architectural keyframe, floating gravity rings, volumetric violet fog, neon landing strips, high contrast lighting grid.');

  // Character Generation State
  const [isGeneratingChar, setIsGeneratingChar] = useState(false);
  const [isEnhancingPrompt, setIsEnhancingPrompt] = useState(false);
  const [regeneratingAngleKey, setRegeneratingAngleKey] = useState<string | null>(null);
  const [newCharName, setNewCharName] = useState('Commander Tariq Al-Mansoor');
  const [newCharDescriptor, setNewCharDescriptor] = useState('32-year-old male tactical commander in Ufotable anime style, slicked-back dark silver hair, intense amber eyes, dark obsidian combat armor with gold trim, flowing armored cloak, noble commanding aura, modest dignified attire.');
  const [newCharVoice, setNewCharVoice] = useState('FISH_VOICE_JP_MALE_TACTICAL_COMMANDER_02');

  const charArchetypes = [
    {
      role: 'Tactical Commander',
      name: 'Commander Tariq Al-Mansoor',
      voice: 'FISH_VOICE_JP_MALE_TACTICAL_COMMANDER_02',
      prompt: '32-year-old male tactical commander in Ufotable anime style, slicked-back dark silver hair, intense amber eyes, dark obsidian combat armor with gold trim, flowing armored cloak, noble commanding aura, modest dignified attire.'
    },
    {
      role: 'Lead Detective',
      name: 'Detective Ren Takahashi',
      voice: 'FISH_VOICE_JP_MALE_TACTICAL_BARITONE_01',
      prompt: '28-year-old male cybernetic detective in MAPPA anime style, tousled dark hair, glowing cobalt cyber-optic eye, matte-black high-collar trenchcoat with cobalt fiber-optic trim, sharp jawline, dignified posture, high-tech tactical holsters.'
    },
    {
      role: 'Archivist Scholar',
      name: 'Archivist Vorn',
      voice: 'FISH_VOICE_JP_MALE_WARRIOR_TENOR_03',
      prompt: '26-year-old male cyber scholar in Production I.G style, round holographic rimless spectacles, dark navy scholar tunic with glowing neural interface gauntlets, refined studious expression, modest attire.'
    },
    {
      role: 'Rival Enforcer',
      name: 'Enforcer Kage',
      voice: 'FISH_VOICE_JP_MALE_TACTICAL_COMMANDER_02',
      prompt: '30-year-old male rival syndicate enforcer in Studio Trigger anime style, spiky crimson-tipped dark hair, angular shoulder pauldrons, plasma blade sheathed on back, fierce gaze, combat bandages on arms.'
    },
    {
      role: 'Grand Sensei / Mentor',
      name: 'Master Jinzo',
      voice: 'FISH_VOICE_EN_MALE_ROYAL_COMMANDER_03',
      prompt: '52-year-old veteran male swordsman in Wit Studio style, silver-streaked dark hair tied back, majestic high-collared navy martial robe with silver threading, stoic battle-tested expression, cybernetic katana.'
    }
  ];

  const handleEnhanceCharacterPrompt = () => {
    setIsEnhancingPrompt(true);
    setTimeout(() => {
      const enhanced = `${newCharDescriptor.trim()}, cinematic MAPPA studio cell-shaded art style, ultra-sharp 4K line-art, intricate fabric folds, symmetrical anime face proportions, atmospheric rim lighting, modest masculine anime attire.`;
      setNewCharDescriptor(enhanced);
      setIsEnhancingPrompt(false);
    }, 400);
  };

  const handleBatchSyncFromScript = async () => {
    if (!onBatchAddEntities || scenes.length === 0) return;
    setIsBatchSyncing(true);
    setBatchSyncMsg(null);

    try {
      const response = await fetch('/api/assets/cast-extractor/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenes: scenes.map(s => ({
            scene_index: s.sequence_order,
            location_name: s.location_name,
            characters_present: s.characters_present_names || s.characters_present || []
          })),
          series_id: activeSeries?.id || 'ser_cyber_aethel',
          art_style_seed: activeSeries?.art_style_seed || 'MAPPA_VIBRANT_CYBERPUNK_CELL_4K'
        })
      });

      const data = await response.json();
      if (data.success) {
        onBatchAddEntities(data.characters, data.environments);
        setBatchSyncMsg(`⚡ Successfully synced ${data.stats.characters_count} Characters & ${data.stats.environments_count} Environments from current episode!`);
      }
    } catch (err) {
      console.error("Batch sync error:", err);
      setBatchSyncMsg("Failed to auto-sync entities from script.");
    } finally {
      setIsBatchSyncing(false);
    }
  };

  // Single Angle Regenerator
  const handleRegenerateAngle = async (angleKey: string) => {
    if (!selectedChar) return;
    setRegeneratingAngleKey(angleKey);

    try {
      const response = await fetch('/api/assets/characters/angle/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          character_name: selectedChar.name,
          visual_descriptor: selectedChar.visual_descriptor,
          angle_type: angleKey,
          master_image_url: selectedChar.master_model_sheet_url || selectedChar.turnaround_url
        })
      });

      const data = await response.json();
      if (data.success && data.image_url) {
        const angleKeyMap: Record<string, number> = { front: 0, threeQuarter: 1, profile: 2, back: 3, expression: 4 };
        const idx = angleKeyMap[angleKey] ?? 0;
        const newRefs = [...selectedChar.reference_images];
        newRefs[idx] = data.image_url;

        const updatedAngles = {
          ...(selectedChar.turnaround_angles || {}),
          [angleKey]: data.image_url
        };

        const updatedChar: Character = {
          ...selectedChar,
          reference_images: newRefs,
          turnaround_angles: updatedAngles,
          turnaround_url: angleKey === 'front' ? data.image_url : selectedChar.turnaround_url
        };

        setSelectedChar(updatedChar);
        onAddCharacter(updatedChar);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setRegeneratingAngleKey(null);
    }
  };

  // Audio Playback Simulation State
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);

  // Detect Script Requirements vs Generated Vault Assets (Smart Next-Step Sequencer)
  const scriptCharacterNames: string[] = Array.from(
    new Set<string>(scenes.flatMap(s => s.characters_present_names || s.characters_present || []).filter(Boolean))
  );
  const scriptLocationNames: string[] = Array.from(
    new Set<string>(scenes.map(s => s.location_name).filter(Boolean))
  );

  const missingCharacters = scriptCharacterNames.filter(
    name => !characters.some(c => c.name.toLowerCase() === name.toLowerCase() && c.master_model_sheet_url)
  );
  const missingEnvironments = scriptLocationNames.filter(
    loc => !environments.some(e => e.location_name.toLowerCase() === loc.toLowerCase() && e.master_keyframe_url)
  );

  // Next recommended entity based on screenplay progression
  const nextRecommendedChar = missingCharacters[0] || null;
  const nextRecommendedEnv = missingEnvironments[0] || null;

  const [smartPromptToast, setSmartPromptToast] = useState<{
    title: string;
    type: 'character' | 'environment';
    name: string;
    description: string;
  } | null>(null);

  const handleQueueNextSmartEntity = (type: 'character' | 'environment', targetName: string) => {
    if (type === 'character') {
      setSubTab('characters');
      setNewCharName(targetName);
      // Determine role from archetype if known
      const archetype = charArchetypes.find(a => a.name.toLowerCase().includes(targetName.toLowerCase())) ||
        charArchetypes[characters.length % charArchetypes.length];
      
      const themeSeed = activeSeries?.art_style_seed || 'MAPPA_VIBRANT_CYBERPUNK_CELL_4K';
      const prompt = `${targetName} in ${themeSeed.replace(/_/g, ' ')} style. Honorable male anime character, slicked-back dark silver hair, intense amber eyes, modest tactical cyber armor with high collar, sharp jawline, 4k master artbook model sheet.`;
      setNewCharDescriptor(prompt);
      setNewCharVoice(archetype.voice);
    } else {
      setSubTab('environments');
      setNewEnvLocation(targetName);
      const matchedScene = scenes.find(s => s.location_name.toLowerCase() === targetName.toLowerCase());
      const themeSeed = activeSeries?.art_style_seed || 'MAPPA_VIBRANT_CYBERPUNK_CELL_4K';
      const lighting = matchedScene?.lighting_mood || 'Volumetric Cyber Dusk';
      const style = `4K Master Anime Architectural Background: ${targetName}. Clean empty stage layout, floor plane depth, ${lighting}. Strict 100% character-free empty landscape in ${themeSeed.replace(/_/g, ' ')} style.`;
      setNewEnvStyle(style);
    }
  };

  const handleGenerateEnvironment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGeneratingEnv(true);

    try {
      const matchedScene = scenes.find(s => s.location_name.toLowerCase() === newEnvLocation.toLowerCase());
      const response = await fetch('/api/assets/environments/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location_name: newEnvLocation,
          style_descriptor: newEnvStyle,
          art_style_seed: activeSeries?.art_style_seed || 'MAPPA_VIBRANT_CYBERPUNK_CELL_4K',
          series_id: activeSeries?.id,
          series_title: activeSeries?.title,
          world_setting: activeSeries?.description,
          scene_context: `Architectural stage setting for ${newEnvLocation}`,
          lighting_condition: matchedScene?.lighting_mood || 'Volumetric Cyber Dusk'
        })
      });

      const data = await response.json();
      if (data.success && data.environment) {
        onAddEnvironment(data.environment);
        setSelectedEnv(data.environment);

        // Compute next entity in sequence for smart prompt
        const remainingChars = scriptCharacterNames.filter(
          name => !characters.some(c => c.name.toLowerCase() === name.toLowerCase())
        );
        const remainingEnvs = scriptLocationNames.filter(
          loc => loc.toLowerCase() !== newEnvLocation.toLowerCase() && !environments.some(env => env.location_name.toLowerCase() === loc.toLowerCase())
        );

        if (remainingChars.length > 0) {
          const featuredScene = scenes.find(s => (s.characters_present_names || s.characters_present || []).includes(remainingChars[0]));
          setSmartPromptToast({
            title: `Environment "${data.environment.location_name}" Generated!`,
            type: 'character',
            name: remainingChars[0],
            description: `Next Screenplay Requirement: Cast member "${remainingChars[0]}" is featured in Scene #${featuredScene?.scene_index || featuredScene?.sequence_order || 1}.`
          });
        } else if (remainingEnvs.length > 0) {
          setSmartPromptToast({
            title: `Environment "${data.environment.location_name}" Generated!`,
            type: 'environment',
            name: remainingEnvs[0],
            description: `Next Screenplay Requirement: Environment "${remainingEnvs[0]}" needed for Scene #${scenes.find(s => s.location_name === remainingEnvs[0])?.scene_index || 2}.`
          });
        }
      } else {
        alert(data.error || "Failed to generate environment keyframe");
      }
    } catch (err) {
      console.error(err);
      alert("Error generating environment keyframe with Qwen Image-Edit");
    } finally {
      setIsGeneratingEnv(false);
    }
  };

  const handleGenerateCharacter = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGeneratingChar(true);

    try {
      const response = await fetch('/api/assets/characters/turnaround', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCharName,
          visual_descriptor: newCharDescriptor,
          fish_voice_token: newCharVoice,
          series_id: activeSeries?.id,
          art_style_seed: activeSeries?.art_style_seed || 'MAPPA_VIBRANT_CYBERPUNK_CELL_4K',
          series_title: activeSeries?.title,
          world_setting: activeSeries?.description
        })
      });

      const data = await response.json();
      if (data.success && data.character) {
        onAddCharacter(data.character);
        setSelectedChar(data.character);

        // Compute next entity in sequence for smart prompt
        const remainingChars = scriptCharacterNames.filter(
          name => name.toLowerCase() !== newCharName.toLowerCase() && !characters.some(c => c.name.toLowerCase() === name.toLowerCase())
        );
        const remainingEnvs = scriptLocationNames.filter(
          loc => !environments.some(env => env.location_name.toLowerCase() === loc.toLowerCase())
        );

        if (remainingChars.length > 0) {
          setSmartPromptToast({
            title: `Character "${data.character.name}" Master Turnaround Generated!`,
            type: 'character',
            name: remainingChars[0],
            description: `Next Screenplay Cast Member: Generate model sheet for "${remainingChars[0]}" with unified theme palette.`
          });
        } else if (remainingEnvs.length > 0) {
          setSmartPromptToast({
            title: `Character "${data.character.name}" Master Turnaround Generated!`,
            type: 'environment',
            name: remainingEnvs[0],
            description: `Next Screenplay Location: Generate character-free 4K background for "${remainingEnvs[0]}".`
          });
        }
      } else {
        alert(data.error || "Failed to generate character turnaround");
      }
    } catch (err) {
      console.error(err);
      alert("Error generating character turnaround sheet");
    } finally {
      setIsGeneratingChar(false);
    }
  };

  const togglePlayAudio = (id: string) => {
    if (playingAudioId === id) {
      setPlayingAudioId(null);
    } else {
      setPlayingAudioId(id);
      setTimeout(() => {
        setPlayingAudioId(null);
      }, 3000);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Step 2 Header Banner */}
      <div className="bg-gradient-to-r from-purple-950/40 via-slate-900 to-slate-900 border border-purple-500/20 rounded-2xl p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 text-[11px] font-bold rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                STEP 2: THE STUDIO DESIGN VAULT
              </span>
              <span className="text-xs font-mono text-slate-400">
                Asset Generation & Persistence Engine
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-100 font-['Cinzel',serif]">
              Qwen Image-Edit 4K Keyframes & Character Turnarounds
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Parallel background workers powered by Qwen Image-Edit populate the continuity vault before rendering: clean 16:9 4K master layout keyframes, standardized multi-angle anime turnaround sheets (Front, 3/4, Profile, Back, Outfit matrix), and Fish Speech voice tracks.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onProceedToSeedance}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-sky-600/30 transition-all cursor-pointer"
            >
              <span>Step 3: Seedance 2.5 Studio</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Sub-tabs */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-slate-800">
          <button
            onClick={() => setSubTab('environments')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              subTab === 'environments'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <MapPin className="h-3.5 w-3.5" />
            <span>Environment Vault ({environments.length} 4K Master Keyframes)</span>
          </button>

          <button
            onClick={() => setSubTab('characters')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              subTab === 'characters'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <User className="h-3.5 w-3.5" />
            <span>Character Soul ID Vault ({characters.length} Turnarounds)</span>
          </button>

          <button
            onClick={() => setSubTab('audio')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              subTab === 'audio'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <Mic className="h-3.5 w-3.5" />
            <span>Fish Speech Audio Vault</span>
          </button>
        </div>
      </div>

      {/* SMART NEXT-STEP IDENTIFIER BANNER */}
      {(nextRecommendedChar || nextRecommendedEnv) && (
        <div className="bg-slate-900/90 border border-sky-500/40 rounded-xl p-4 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="h-9 w-9 rounded-lg bg-sky-500/20 border border-sky-500/40 text-sky-400 flex items-center justify-center shrink-0">
              <Sparkles className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-sky-400 font-mono">
                  Smart Identifier Recommendation
                </span>
                <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-slate-400">
                  Theme: {activeSeries?.art_style_seed || 'MAPPA 4K'}
                </span>
              </div>
              <p className="text-xs text-slate-200 mt-0.5">
                {nextRecommendedChar ? (
                  <span>
                    Screenplay cast member <strong className="text-white font-semibold">"{nextRecommendedChar}"</strong> has not been generated yet. Keep character & scene prompts interlinked.
                  </span>
                ) : (
                  <span>
                    Screenplay environment <strong className="text-white font-semibold">"{nextRecommendedEnv}"</strong> is required for upcoming scene staging (clean character-free layout).
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {nextRecommendedChar && (
              <button
                onClick={() => handleQueueNextSmartEntity('character', nextRecommendedChar)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-md shadow-sky-600/30 transition-all cursor-pointer"
              >
                <User className="h-3.5 w-3.5" />
                <span>Generate Character "{nextRecommendedChar}"</span>
              </button>
            )}
            {nextRecommendedEnv && (
              <button
                onClick={() => handleQueueNextSmartEntity('environment', nextRecommendedEnv)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md shadow-purple-600/30 transition-all cursor-pointer"
              >
                <MapPin className="h-3.5 w-3.5" />
                <span>Generate Background "{nextRecommendedEnv}"</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* SMART PROMPT TOAST / MODAL NOTIFICATION */}
      {smartPromptToast && (
        <div className="bg-gradient-to-r from-sky-950/80 via-slate-900 to-purple-950/80 border border-sky-400/50 rounded-xl p-4 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-start gap-3">
            <div className="h-8 w-8 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shrink-0">
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white flex items-center gap-2">
                {smartPromptToast.title}
                <span className="text-[10px] font-mono text-sky-400">Prompting Interlinked</span>
              </h4>
              <p className="text-[11px] text-slate-300 mt-0.5">
                {smartPromptToast.description}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                handleQueueNextSmartEntity(smartPromptToast.type, smartPromptToast.name);
                setSmartPromptToast(null);
              }}
              className="px-3 py-1.5 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white text-xs font-bold rounded-lg shadow-md transition-all cursor-pointer"
            >
              Auto-Fill Next: {smartPromptToast.name}
            </button>
            <button
              onClick={() => setSmartPromptToast(null)}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 text-xs rounded-lg cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* SUB-TAB 1: ENVIRONMENT VAULT */}
      {subTab === 'environments' && (
        <div className="space-y-6">
          {/* Smart Screenplay Locations Identifier */}
          {scriptLocationNames.length > 0 && (
            <div className="bg-slate-900/90 border border-purple-500/30 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-purple-400" />
                  <span className="text-xs font-bold text-slate-100 uppercase tracking-wider font-mono">
                    Screenplay Locations Smart Identifier
                  </span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-500/30">
                  {environments.length} of {scriptLocationNames.length} Backgrounds Ready
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {scriptLocationNames.map((locName) => {
                  const existing = environments.find(e => e.location_name.toLowerCase() === locName.toLowerCase());
                  const isReady = !!existing?.master_keyframe_url;
                  
                  return (
                    <div 
                      key={locName}
                      className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 transition-all ${
                        isReady 
                          ? 'bg-slate-950/70 border-emerald-500/40 text-slate-200' 
                          : 'bg-purple-950/20 border-purple-500/40 text-slate-300 hover:border-purple-400'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className={`h-2 w-2 rounded-full shrink-0 ${isReady ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`} />
                          <h4 className="text-xs font-bold truncate text-white">{locName}</h4>
                        </div>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">
                          {isReady ? '4K Keyframe Ready' : 'Pending Background'}
                        </p>
                      </div>

                      {isReady ? (
                        <button
                          type="button"
                          onClick={() => existing && setSelectedEnv(existing)}
                          className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 font-mono shrink-0 cursor-pointer"
                        >
                          View
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleQueueNextSmartEntity('environment', locName)}
                          className="px-2.5 py-1 rounded bg-purple-600 hover:bg-purple-500 text-[10px] font-bold text-white shrink-0 shadow-sm cursor-pointer"
                        >
                          Auto-Fill
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left: Environment List & Generator */}
          <div className="lg:col-span-1 space-y-4">
            
            {/* Quick Generator Form */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                <Sparkles className="h-4 w-4 text-purple-400" />
                <span>Generate New 4K Environment (Qwen Image-Edit)</span>
              </div>

              <form onSubmit={handleGenerateEnvironment} className="space-y-3">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Location Name</label>
                  <input
                    type="text"
                    value={newEnvLocation}
                    onChange={(e) => setNewEnvLocation(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Style & Lighting Prompt</label>
                  <textarea
                    rows={2}
                    value={newEnvStyle}
                    onChange={(e) => setNewEnvStyle(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isGeneratingEnv}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-purple-600/20 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isGeneratingEnv ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      <span>Synthesizing 4K Keyframe...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="h-3.5 w-3.5" />
                      <span>Render & Commit to Hostinger VPS</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Existing Environment Cards */}
            <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Vaulted Environments ({environments.length})
              </span>
              {environments.map((env) => (
                <div
                  key={env.id}
                  onClick={() => setSelectedEnv(env)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center gap-3 ${
                    selectedEnv?.id === env.id
                      ? 'bg-purple-950/40 border-purple-500 text-slate-100 shadow-md shadow-purple-500/10'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  {env.master_keyframe_url ? (
                    <img
                      src={env.master_keyframe_url}
                      alt={env.location_name}
                      className="h-12 w-16 object-cover rounded-lg border border-slate-700 shrink-0"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="h-12 w-16 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-center text-slate-600 shrink-0">
                      <MapPin className="h-5 w-5 text-purple-400" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-bold truncate">{env.location_name}</h4>
                    <p className="text-[10px] text-slate-400 font-mono truncate">{env.id}</p>
                    <span className="text-[10px] text-purple-400 flex items-center gap-1 mt-0.5">
                      <CheckCircle2 className="h-3 w-3" /> 4K Keyframe Committed
                    </span>
                  </div>
                </div>
              ))}
            </div>

          </div>

          {/* Right: Master 4K Keyframe Inspector */}
          <div className="lg:col-span-2 space-y-4">
            {selectedEnv ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-100 text-base">{selectedEnv.location_name}</h3>
                      <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        16:9 4K Master Layout
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{selectedEnv.style_descriptor}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => openQwenEdit(selectedEnv.master_keyframe_url, 'environment')}
                      className="px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm shadow-cyan-500/20"
                    >
                      <Wand2 className="h-3.5 w-3.5 text-cyan-400" />
                      <span>Qwen Image-Edit Keyframe</span>
                    </button>
                    <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                      <ShieldCheck className="h-3.5 w-3.5" /> Continuity Locked
                    </span>
                  </div>
                </div>

                {/* Main 4K Keyframe Image Container */}
                <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-800 bg-slate-950 group flex items-center justify-center">
                  {selectedEnv.master_keyframe_url ? (
                    <>
                      <img
                        src={selectedEnv.master_keyframe_url}
                        alt={selectedEnv.location_name}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      
                      {/* Visual Perspective Overlay */}
                      <div className="absolute inset-0 pointer-events-none border border-cyan-500/30 m-6 rounded flex items-center justify-center opacity-60 group-hover:opacity-100 transition-opacity">
                        <div className="w-full h-0.5 bg-cyan-500/20"></div>
                        <div className="h-full w-0.5 bg-cyan-500/20 absolute"></div>
                        <div className="absolute top-2 left-2 bg-slate-950/80 px-2 py-0.5 rounded text-[10px] font-mono text-cyan-300 border border-cyan-500/30">
                          SEEDANCE LANE 1 REF: PERSPECTIVE LOCK ACTIVE
                        </div>
                      </div>

                      <div className="absolute bottom-3 right-3 bg-slate-950/90 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-slate-800 text-[11px] font-mono text-slate-300">
                        Resolution: 3840x2160 • Clean Character-Free Layout
                      </div>
                    </>
                  ) : (
                    <div className="p-8 text-center space-y-3">
                      <div className="h-12 w-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center mx-auto text-purple-400">
                        <MapPin className="h-6 w-6" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-200">No Keyframe Generated Yet</h4>
                        <p className="text-xs text-slate-400 mt-1 max-w-sm">
                          Use the Qwen Image-Edit engine to generate this 4K character-free anime layout keyframe.
                        </p>
                      </div>
                      <button
                        onClick={async () => {
                          setIsGeneratingEnv(true);
                          try {
                            const res = await fetch('/api/assets/environments/generate', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                location_name: selectedEnv.location_name,
                                style_descriptor: selectedEnv.style_descriptor,
                                art_style_seed: activeSeries?.art_style_seed,
                                series_id: activeSeries?.id
                              })
                            });
                            const data = await res.json();
                            if (data.success && data.environment) {
                              onAddEnvironment(data.environment);
                              setSelectedEnv(data.environment);
                            }
                          } catch (e) {
                            console.error(e);
                          } finally {
                            setIsGeneratingEnv(false);
                          }
                        }}
                        disabled={isGeneratingEnv}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-purple-600/30 transition-all cursor-pointer disabled:opacity-50 inline-flex items-center gap-2"
                      >
                        <Sparkles className="h-4 w-4" />
                        <span>{isGeneratingEnv ? 'Generating Keyframe via Qwen...' : 'Generate Keyframe (Qwen Image-Edit)'}</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Camera Angles & Lighting Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                      Registered Camera Angles
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {(selectedEnv.camera_angles || ['Standard Eye-Level', 'Low-Tilt Perspective']).map((a, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px]">
                          🎥 {a}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                      Atmospheric Lighting Grid
                    </span>
                    <span className="text-xs text-purple-300 font-mono">
                      {selectedEnv.lighting_time || 'Midnight Rain / Cyan Volumetric Fluorescent'}
                    </span>
                  </div>
                </div>

              </div>
            ) : (
              <div className="p-12 text-center bg-slate-900/40 border border-slate-800 rounded-2xl">
                <MapPin className="h-10 w-10 text-slate-600 mx-auto mb-2" />
                <p className="text-xs text-slate-400">Select or generate an environment keyframe.</p>
              </div>
            )}
          </div>

        </div>
      </div>
    )}

      {/* SUB-TAB 2: CHARACTER SOUL ID VAULT */}
      {subTab === 'characters' && (
        <div className="space-y-4">

          {/* AI CHARACTER REFERENCE CONSISTENCY SHIELD & ENHANCER */}
          {(() => {
            const insufficientChars = characters.filter(isCharReferenceInsufficient);
            return (
              <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 rounded-2xl p-4 shadow-xl space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 shrink-0">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-100 uppercase tracking-wider font-mono">
                          Character Consistency Shield & Auto-Enhancer
                        </span>
                        {insufficientChars.length === 0 ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            All Turnarounds Locked (100% Quality)
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            {insufficientChars.length} Insufficient Reference{insufficientChars.length > 1 ? 's' : ''} Detected
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Guarantees that face landmarks, hair structures, and armor details remain identical across all anime scenes. Insufficient references (stock images or short descriptors) can be auto-upgraded to 4-angle studio turnaround blueprints.
                      </p>
                    </div>
                  </div>

                  {insufficientChars.length > 0 && (
                    <button
                      type="button"
                      onClick={handleBatchAutoEnhanceAll}
                      disabled={isBatchEnhancing}
                      className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-600 to-indigo-600 hover:from-amber-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-amber-600/20 transition-all shrink-0 cursor-pointer disabled:opacity-50"
                    >
                      {isBatchEnhancing ? (
                        <>
                          <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                          <span>Enhancing {insufficientChars.length} Characters...</span>
                        </>
                      ) : (
                        <>
                          <Wand2 className="h-3.5 w-3.5" />
                          <span>Auto-Enhance All ({insufficientChars.length})</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                {enhanceProgressMsg && (
                  <div className="text-xs px-3 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 flex items-center gap-2 font-mono">
                    <Sparkles className="h-3.5 w-3.5 text-indigo-400 animate-spin" />
                    <span>{enhanceProgressMsg}</span>
                  </div>
                )}
              </div>
            );
          })()}

          {/* Screenplay Cast Smart Identifier */}
          {scriptCharacterNames.length > 0 && (
            <div className="bg-slate-900/90 border border-sky-500/30 rounded-2xl p-4 space-y-3 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-sky-400" />
                  <span className="text-xs font-bold text-slate-100 uppercase tracking-wider font-mono">
                    Screenplay Cast Smart Identifier
                  </span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-500/30">
                  {scriptCharacterNames.filter(cName => characters.some(c => c.name.toLowerCase() === cName.toLowerCase() && (c.master_model_sheet_url || c.turnaround_url))).length} of {scriptCharacterNames.length} Characters Ready
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {scriptCharacterNames.map((cName) => {
                  const existing = characters.find(c => c.name.toLowerCase() === cName.toLowerCase());
                  const isReady = !!existing?.master_model_sheet_url || !!existing?.turnaround_url;
                  
                  return (
                    <div 
                      key={cName}
                      className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 transition-all ${
                        isReady 
                          ? 'bg-slate-950/70 border-emerald-500/40 text-slate-200' 
                          : 'bg-sky-950/20 border-sky-500/40 text-slate-300 hover:border-sky-400'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className={`h-2 w-2 rounded-full shrink-0 ${isReady ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`} />
                          <h4 className="text-xs font-bold truncate text-white">{cName}</h4>
                        </div>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">
                          {isReady ? '4K Model Sheet Ready' : 'Pending Turnaround'}
                        </p>
                      </div>

                      {isReady ? (
                        <button
                          type="button"
                          onClick={() => existing && setSelectedChar(existing)}
                          className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 font-mono shrink-0 cursor-pointer"
                        >
                          View
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleQueueNextSmartEntity('character', cName)}
                          className="px-2.5 py-1 rounded bg-sky-600 hover:bg-sky-500 text-[10px] font-bold text-white shrink-0 shadow-sm cursor-pointer"
                        >
                          Auto-Fill
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {batchSyncMsg && (
            <div className="text-xs px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{batchSyncMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left: Character List & Generator */}
            <div className="lg:col-span-1 space-y-4">
              
              {/* Quick Character Generator */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                    <Sparkles className="h-4 w-4 text-purple-400" />
                    <span>Create Honorable Male Character</span>
                  </div>
                  <span className="text-[10px] font-mono text-purple-400">Triple-A Anime Model Sheet</span>
                </div>

                {/* Role Archetype Presets */}
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">
                    Archetype Role Presets
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {charArchetypes.map((arch, aIdx) => (
                      <button
                        key={aIdx}
                        type="button"
                        onClick={() => {
                          setNewCharName(arch.name);
                          setNewCharDescriptor(arch.prompt);
                          setNewCharVoice(arch.voice);
                        }}
                        className="px-2 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 border border-slate-700 hover:border-purple-500 transition-colors cursor-pointer"
                      >
                        {arch.role}
                      </button>
                    ))}
                  </div>
                </div>

                <form onSubmit={handleGenerateCharacter} className="space-y-3">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Character Name</label>
                    <input
                      type="text"
                      value={newCharName}
                      onChange={(e) => setNewCharName(e.target.value)}
                      required
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] text-slate-400">Visual & Outfit Descriptor</label>
                      <button
                        type="button"
                        onClick={handleEnhanceCharacterPrompt}
                        disabled={isEnhancingPrompt}
                        className="text-[10px] font-bold text-sky-400 hover:text-sky-300 flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Wand2 className="h-3 w-3" />
                        <span>{isEnhancingPrompt ? 'Enhancing...' : '✨ Enhance Prompt'}</span>
                      </button>
                    </div>
                    <textarea
                      rows={3}
                      value={newCharDescriptor}
                      onChange={(e) => setNewCharDescriptor(e.target.value)}
                      required
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Fish Speech Voice Mapping</label>
                    <select
                      value={newCharVoice}
                      onChange={(e) => setNewCharVoice(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-rose-300 focus:outline-none font-mono"
                    >
                      <option value="FISH_VOICE_JP_MALE_TACTICAL_BARITONE_01">JP Male Tactical Baritone (Detective Ren)</option>
                      <option value="FISH_VOICE_JP_MALE_TACTICAL_COMMANDER_02">JP Male Tactical Commander (Tariq)</option>
                      <option value="FISH_VOICE_EN_MALE_ROYAL_COMMANDER_03">EN Male Royal Commander (Kaelen)</option>
                      <option value="FISH_VOICE_JP_MALE_WARRIOR_TENOR_03">JP Male Warrior Tenor</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={isGeneratingChar}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-purple-600/20 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {isGeneratingChar ? (
                      <>
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        <span>Generating Master 360° Model Sheet...</span>
                      </>
                    ) : (
                      <>
                        <Plus className="h-3.5 w-3.5" />
                        <span>Generate Master 16:9 Model Sheet</span>
                      </>
                    )}
                  </button>
                </form>
              </div>

            {/* Existing Characters List */}
            <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Soul ID Vault ({characters.length})
              </span>
              {characters.map((char) => {
                const isInsufficient = isCharReferenceInsufficient(char);
                return (
                  <div
                    key={char.id}
                    onClick={() => setSelectedChar(char)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between gap-3 ${
                      selectedChar?.id === char.id
                        ? 'bg-purple-950/40 border-purple-500 text-slate-100 shadow-md shadow-purple-500/10'
                        : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {(char.reference_images?.[0] || char.turnaround_url) ? (
                        <img
                          src={char.reference_images?.[0] || char.turnaround_url}
                          alt={char.name}
                          className="h-12 w-12 object-cover rounded-xl border border-slate-700 shrink-0"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="h-12 w-12 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-center text-rose-400 shrink-0">
                          <User className="h-5 w-5" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs font-bold truncate">{char.name}</h4>
                          {isInsufficient ? (
                            <span className="px-1.5 py-0.2 rounded text-[8px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0">
                              Placeholder
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.2 rounded text-[8px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0">
                              Turnaround Locked
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-purple-400 font-mono truncate">{char.fish_voice_token}</p>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                          {char.reference_images.length} Turnaround Angles
                        </span>
                      </div>
                    </div>

                    {isInsufficient && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAutoEnhanceCharacter(char);
                        }}
                        disabled={enhancingCharId === char.id}
                        className="px-2 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[9px] font-mono font-bold flex items-center gap-1 transition-all shrink-0 cursor-pointer"
                        title="Auto-enhance this character turnaround reference"
                      >
                        {enhancingCharId === char.id ? (
                          <RefreshCw className="h-2.5 w-2.5 animate-spin" />
                        ) : (
                          <Wand2 className="h-2.5 w-2.5" />
                        )}
                        <span>{enhancingCharId === char.id ? '...' : 'Enhance'}</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

          </div>

          {/* Right: Character Turnaround Sheet Inspector */}
          <div className="lg:col-span-2 space-y-4">
            {selectedChar ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-100 text-base">{selectedChar.name}</h3>
                      <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        Seedance Lane 2 Soul ID
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{selectedChar.visual_descriptor}</p>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-mono text-purple-300 block">{selectedChar.fish_voice_token}</span>
                  </div>
                </div>

                {/* Master Character Model Sheet Banner */}
                <div className="bg-slate-950 rounded-xl overflow-hidden border border-purple-500/40 relative">
                  <div className="p-3 bg-gradient-to-r from-purple-950/80 to-slate-950 border-b border-purple-500/20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-purple-400" />
                      <span className="text-xs font-bold text-slate-100 uppercase tracking-wider">
                        Master Model Sheet (Unified 360° Studio Reference Canvas)
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openQwenEdit(selectedChar.master_model_sheet_url || selectedChar.turnaround_url || selectedChar.reference_images[0], 'character')}
                        className="px-2.5 py-1 rounded bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-[10px] font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm shadow-cyan-500/20"
                      >
                        <Wand2 className="h-3 w-3 text-cyan-400" />
                        <span>Qwen Image-Edit (ApiFrame)</span>
                      </button>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hidden sm:inline-block">
                        100% Design Consistency
                      </span>
                    </div>
                  </div>

                  <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-950 group flex items-center justify-center">
                    {(selectedChar.master_model_sheet_url || selectedChar.turnaround_url || selectedChar.reference_images[0]) ? (
                      <>
                        <img
                          src={selectedChar.master_model_sheet_url || selectedChar.turnaround_url || selectedChar.reference_images[0]}
                          alt={`${selectedChar.name} Master Model Sheet`}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent pointer-events-none" />
                        
                        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[10px] text-slate-300 font-mono">
                          <span className="bg-slate-900/90 backdrop-blur px-2 py-1 rounded border border-slate-700">
                            Primary Reference Anchor: {selectedChar.name}
                          </span>
                          <span className="bg-slate-900/90 backdrop-blur px-2 py-1 rounded border border-slate-700 text-purple-300">
                            Qwen Image-Edit • 16:9 Widescreen Master
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="p-8 text-center space-y-3">
                        <div className="h-12 w-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center mx-auto text-purple-400">
                          <User className="h-6 w-6" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-200">No Model Sheet Generated Yet</h4>
                          <p className="text-xs text-slate-400 mt-1 max-w-sm">
                            Generate this character's master 360° turnaround model sheet using Qwen Image-Edit.
                          </p>
                        </div>
                        <button
                          onClick={async () => {
                            setIsGeneratingChar(true);
                            try {
                              const res = await fetch('/api/assets/characters/turnaround', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                  name: selectedChar.name,
                                  visual_descriptor: selectedChar.visual_descriptor,
                                  fish_voice_token: selectedChar.fish_voice_token,
                                  series_id: activeSeries?.id,
                                  art_style_seed: activeSeries?.art_style_seed
                                })
                              });
                              const data = await res.json();
                              if (data.success && data.character) {
                                onAddCharacter(data.character);
                                setSelectedChar(data.character);
                              }
                            } catch (e) {
                              console.error(e);
                            } finally {
                              setIsGeneratingChar(false);
                            }
                          }}
                          disabled={isGeneratingChar}
                          className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-purple-600/30 transition-all cursor-pointer disabled:opacity-50 inline-flex items-center gap-2"
                        >
                          <Sparkles className="h-4 w-4" />
                          <span>{isGeneratingChar ? 'Generating Model Sheet via Qwen...' : 'Generate Model Sheet (Qwen Image-Edit)'}</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Standardized Multi-Angle Turnaround Grid */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                      Standardized Anime Turnaround Matrix (Front • 3/4 • Profile • Back • Expression)
                    </span>
                    <span className="text-[10px] text-purple-400 font-mono">
                      Seedance 2.5 Multi-Reference Consistency Guard Active
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    {[
                      { key: 'front', label: 'Front View (0°)', defaultImg: selectedChar.turnaround_angles?.front || selectedChar.reference_images?.[0] },
                      { key: 'threeQuarter', label: '3/4 Angle (45°)', defaultImg: selectedChar.turnaround_angles?.threeQuarter || selectedChar.reference_images?.[1] },
                      { key: 'profile', label: 'Profile View (90°)', defaultImg: selectedChar.turnaround_angles?.profile || selectedChar.reference_images?.[2] },
                      { key: 'back', label: 'Back View (180°)', defaultImg: selectedChar.turnaround_angles?.back || selectedChar.reference_images?.[3] },
                      { key: 'expression', label: 'Action Expression', defaultImg: selectedChar.turnaround_angles?.expression || selectedChar.reference_images?.[4] }
                    ].map((angle, i) => {
                      const imgUrl = angle.defaultImg;
                      const isRegeneratingThis = regeneratingAngleKey === angle.key;

                      return (
                        <div key={angle.key} className="space-y-1.5">
                          <div className="aspect-[3/4] rounded-xl overflow-hidden border border-slate-800 bg-slate-950 relative group flex items-center justify-center">
                            {imgUrl ? (
                              <img
                                src={imgUrl}
                                alt={`${selectedChar.name} ${angle.label}`}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <div className="p-3 text-center flex flex-col items-center justify-center h-full">
                                <User className="h-6 w-6 text-slate-600 mb-1" />
                                <span className="text-[10px] text-slate-400 font-mono block">Angle {i + 1}</span>
                                <button
                                  onClick={() => handleRegenerateAngle(angle.key)}
                                  disabled={isRegeneratingThis}
                                  className="mt-2 px-2 py-1 bg-purple-950/80 hover:bg-purple-900 border border-purple-500/40 text-purple-200 rounded text-[9px] font-mono flex items-center gap-1 cursor-pointer"
                                >
                                  <Sparkles className={`h-2.5 w-2.5 ${isRegeneratingThis ? 'animate-spin' : ''}`} />
                                  <span>{isRegeneratingThis ? 'Rendering...' : 'Gen Qwen'}</span>
                                </button>
                              </div>
                            )}

                            {imgUrl && (
                              <>
                                <div className="absolute top-1.5 left-1.5 bg-slate-950/80 px-1.5 py-0.5 rounded text-[9px] font-mono text-slate-300">
                                  Angle {i + 1}
                                </div>

                                {/* Quick Regenerate Overlay Button */}
                                <button
                                  onClick={() => handleRegenerateAngle(angle.key)}
                                  disabled={isRegeneratingThis}
                                  className="absolute bottom-1.5 right-1.5 bg-slate-950/90 hover:bg-purple-600 text-white p-1.5 rounded-lg border border-slate-700 transition-all opacity-0 group-hover:opacity-100 flex items-center gap-1 text-[9px] cursor-pointer"
                                  title={`Regenerate ${angle.label}`}
                                >
                                  <RefreshCw className={`h-3 w-3 ${isRegeneratingThis ? 'animate-spin' : ''}`} />
                                  <span className="font-mono">Fix Angle</span>
                                </button>
                              </>
                            )}
                          </div>
                          <div className="flex items-center justify-between px-0.5">
                            <span className="text-[10px] text-slate-300 font-medium truncate">
                              {angle.label}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Outfit Matrix & Palette Anchors */}
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                      Seedance 2.5 Feature Anchors
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-300 font-mono">
                        #face_mesh_lock
                      </span>
                      <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-300 font-mono">
                        #outfit_matrix_lock
                      </span>
                      <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-300 font-mono">
                        #silhouette_continuity
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {(selectedChar.outfit_palette || ['#0A0F1D', '#00F0FF', '#7928CA', '#FFFFFF']).map((color, cIdx) => (
                      <div
                        key={cIdx}
                        className="h-6 w-6 rounded-md border border-slate-700 shadow-sm"
                        style={{ backgroundColor: color }}
                        title={`Color Anchor: ${color}`}
                      />
                    ))}
                  </div>
                </div>

              </div>
            ) : (
              <div className="p-12 text-center bg-slate-900/40 border border-slate-800 rounded-2xl">
                <User className="h-10 w-10 text-slate-600 mx-auto mb-2" />
                <p className="text-xs text-slate-400">Select or generate a character turnaround.</p>
              </div>
            )}
          </div>

        </div>
      </div>
      )}

      {/* SUB-TAB 3: FISH SPEECH AUDIO VAULT */}
      {subTab === 'audio' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-100 text-base font-['Cinzel',serif]">
                Fish Speech / Fish Audio Scene Synthesis
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Pre-renders dialogue audio files mapped to characters' voice tokens for Seedance 2.5 Joint Audio-Visual Lip/Jaw tracking.
              </p>
            </div>
            <span className="px-2.5 py-1 text-xs font-mono rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Joint AV Lip/Jaw Synchronization Active
            </span>
          </div>

          <div className="space-y-3">
            {scenes.map((scene) => (
              <div
                key={scene.id}
                className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-6 w-6 rounded bg-rose-500/20 text-rose-300 text-[11px] font-bold flex items-center justify-center font-mono">
                      #{scene.scene_index}
                    </span>
                    <span className="font-bold text-xs text-slate-200">{scene.location_name}</span>
                  </div>

                  <span className="text-xs font-mono text-slate-400">{scene.duration_seconds}s target</span>
                </div>

                {scene.dialogue && scene.dialogue.length > 0 ? (
                  <div className="space-y-2">
                    {scene.dialogue.map((d, dIdx) => {
                      const isPlaying = playingAudioId === `${scene.id}_${dIdx}`;
                      return (
                        <div
                          key={dIdx}
                          className="bg-slate-900 border border-slate-800/80 rounded-lg p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                          <div className="flex items-start gap-3">
                            <button
                              onClick={() => togglePlayAudio(`${scene.id}_${dIdx}`)}
                              className="h-8 w-8 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-600/30 transition-transform active:scale-95"
                            >
                              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
                            </button>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-xs text-emerald-400">{d.speaker}</span>
                                <span className="text-[10px] font-mono text-slate-500">
                                  {d.fish_voice_token || 'FISH_VOICE_JP_MALE_01'}
                                </span>
                              </div>
                              <p className="text-xs text-slate-200 mt-0.5 italic">"{d.line}"</p>
                            </div>
                          </div>

                          {/* Simulated Waveform Visualizer */}
                          <div className="flex items-center gap-1 self-end sm:self-center">
                            {[12, 24, 18, 32, 16, 28, 20, 36, 14, 26, 22, 18].map((height, wIdx) => (
                              <div
                                key={wIdx}
                                className={`w-1 rounded-full transition-all ${
                                  isPlaying ? 'bg-emerald-400 animate-pulse' : 'bg-slate-700'
                                }`}
                                style={{ height: isPlaying ? `${Math.random() * 24 + 8}px` : `${height / 2}px` }}
                              />
                            ))}
                            <span className="text-[10px] font-mono text-slate-400 ml-2">48kHz MP3</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">No spoken dialogue in this scene block.</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Footer */}
      <div className="sticky bottom-4 z-20 bg-slate-950/95 backdrop-blur-md border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xl">
        <div className="flex items-center gap-3">
          {onBackToScript && (
            <button
              onClick={onBackToScript}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-semibold transition-colors cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>← Step 1: Script</span>
            </button>
          )}
          <div className="text-xs text-slate-300">
            🏛️ <strong className="text-purple-400">{environments.length} 4K Keyframes</strong> and <strong className="text-rose-400">{characters.length} Character Turnarounds</strong> vaulted.
          </div>
        </div>
        
        <button
          onClick={onProceedToSeedance}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 via-indigo-600 to-purple-600 hover:from-sky-500 hover:to-purple-500 text-white text-xs font-bold shadow-lg shadow-sky-600/30 transition-all cursor-pointer w-full sm:w-auto justify-center"
        >
          <span>Proceed to Step 3: Seedance 2.5 Multimodal Studio</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      {/* Qwen Image-Edit Studio Modal (Newest Qwen 2.5VL Pro Model via ApiFrame) */}
      {showQwenEditModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-cyan-500/40 rounded-2xl max-w-3xl w-full p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-cyan-500/10 rounded-xl border border-cyan-500/30">
                  <Wand2 className="h-5 w-5 text-cyan-400 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                    <span>Qwen Image-Edit Studio</span>
                    <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      Newest Qwen 2.5VL Pro (ApiFrame Engine)
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Precision multimodal image editing, character outfit customization, lighting & atmosphere refinement
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowQwenEditModal(false)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Source vs Result Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Source Image */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-mono text-slate-400 block uppercase">
                  1. Source Reference Canvas
                </span>
                <div className="aspect-video bg-slate-950 rounded-xl overflow-hidden border border-slate-800 relative">
                  {qwenSourceImage ? (
                    <img
                      src={qwenSourceImage}
                      alt="Source Canvas"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs font-mono">
                      No Source Image Loaded
                    </div>
                  )}
                  <div className="absolute top-2 left-2 bg-slate-950/80 backdrop-blur px-2 py-0.5 rounded text-[10px] font-mono text-slate-300">
                    Original
                  </div>
                </div>
              </div>

              {/* Edited Result Image */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-mono text-cyan-400 block uppercase flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  2. Qwen 2.5VL Pro Render
                </span>
                <div className="aspect-video bg-slate-950 rounded-xl overflow-hidden border border-cyan-500/30 relative flex items-center justify-center">
                  {isQwenEditing ? (
                    <div className="text-center p-4 space-y-2">
                      <RefreshCw className="h-8 w-8 text-cyan-400 animate-spin mx-auto" />
                      <p className="text-xs font-bold text-cyan-300">Processing Qwen Image-Edit via ApiFrame...</p>
                      <p className="text-[10px] text-slate-400 font-mono">Model: qwen-image-edit-2.5-pro</p>
                    </div>
                  ) : qwenEditResult?.edited_image_url ? (
                    <>
                      <img
                        src={qwenEditResult.edited_image_url}
                        alt="Qwen Edited Result"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-2 right-2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded text-[10px] font-mono">
                        ✓ Qwen Edited
                      </div>
                    </>
                  ) : (
                    <div className="text-center p-6 text-slate-500 space-y-1">
                      <Wand2 className="h-6 w-6 mx-auto opacity-40" />
                      <p className="text-xs">Enter your edit instructions below and click Run Qwen Image-Edit.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Edit Instruction Form */}
            <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1">
                  Natural Language Edit Instruction (Qwen Multimodal Visual Prompting)
                </label>
                <textarea
                  rows={2}
                  value={qwenEditPrompt}
                  onChange={(e) => setQwenEditPrompt(e.target.value)}
                  placeholder="e.g. Add matte black tactical combat armor with glowing cyan fiber optic seams, sharp jawline, intense eyes"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              {/* Preset Instruction Pills */}
              <div>
                <span className="text-[10px] text-slate-400 block mb-1 font-mono uppercase">Quick Edit Presets:</span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'Add tactical combat armor with cyan fiber optic seams',
                    'Modify expression to fierce tactical determination',
                    'Adjust lighting to dark atmospheric twilight with volumetric cyan fog',
                    'Add rain effect and atmospheric ground reflections',
                    'Add holographic neural HUD visor over right eye'
                  ].map((preset, pIdx) => (
                    <button
                      key={pIdx}
                      type="button"
                      onClick={() => setQwenEditPrompt(preset)}
                      className="px-2 py-1 rounded bg-slate-900 hover:bg-cyan-950 text-[10px] text-slate-300 hover:text-cyan-300 border border-slate-800 hover:border-cyan-500/40 transition-colors cursor-pointer"
                    >
                      + {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Strength Slider */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2">
                  <Sliders className="h-3.5 w-3.5 text-cyan-400" />
                  <span className="text-xs text-slate-300 font-mono">Edit Strength / Guidance: {(qwenStrength * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={qwenStrength}
                  onChange={(e) => setQwenStrength(parseFloat(e.target.value))}
                  className="w-36 accent-cyan-500"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-[10px] text-slate-400 font-mono">
                Provider: ApiFrame Cloud • Model: qwen-image-edit-2.5-pro
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowQwenEditModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Close
                </button>

                <button
                  type="button"
                  onClick={handleRunQwenImageEdit}
                  disabled={isQwenEditing || !qwenEditPrompt}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-600 via-indigo-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white text-xs font-bold shadow-lg shadow-cyan-500/20 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isQwenEditing ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Executing Qwen Edit...</span>
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-4 w-4 text-cyan-300" />
                      <span>Execute Qwen Image-Edit (ApiFrame)</span>
                    </>
                  )}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
