import React, { useState, useEffect, useRef } from 'react';
import { 
  Film, 
  Sparkles, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX,
  Subtitles, 
  Music, 
  Download, 
  Share2, 
  RefreshCw, 
  CheckCircle2, 
  Clock, 
  Layers, 
  Sliders, 
  Tv, 
  Plus, 
  Trash2, 
  ExternalLink,
  ShieldCheck,
  ArrowLeft,
  Home,
  FastForward,
  Rewind,
  Maximize2,
  Minimize2,
  MessageSquare
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Scene, Episode, Series, Character, Environment, DialogueLine } from '../types';

interface TimelineCompilerTabProps {
  activeSeries: Series | null;
  activeEpisode: Episode | null;
  scenes: Scene[];
  characters: Character[];
  environments: Environment[];
  onUpdateEpisodeMasterVideo: (videoUrl: string) => void;
  onSpawnSequel: () => void;
  onBackToSeedance?: () => void;
  onBackToHome?: () => void;
}

export const TimelineCompilerTab: React.FC<TimelineCompilerTabProps> = ({
  activeSeries,
  activeEpisode,
  scenes,
  characters,
  environments,
  onUpdateEpisodeMasterVideo,
  onSpawnSequel,
  onBackToSeedance,
  onBackToHome
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isCinematicMotion, setIsCinematicMotion] = useState(true);
  const [burnSubtitles, setBurnSubtitles] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [foleyVolume, setFoleyVolume] = useState(0.6);
  const [foleyAtmosphere, setFoleyAtmosphere] = useState<'rain' | 'wind' | 'cyber' | 'none'>('rain');
  const [bgmTrack, setBgmTrack] = useState<string>('halal_acoustic_foley_master');
  const [isCompiling, setIsCompiling] = useState(false);
  const [compileReceipt, setCompileReceipt] = useState<any>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const foleyAudioRef = useRef<HTMLAudioElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastTickTimeRef = useRef<number>(Date.now());
  const activeSpokenKeyRef = useRef<string>('');

  // Halal Foley Soundtracks (0% Music, 100% Acoustic & Environmental SFX)
  const FOLEY_TRACKS: Record<string, string> = {
    foley_rain_asphalt: 'https://actions.google.com/sounds/v1/weather/rain_heavy.ogg',
    foley_thunder_wind: 'https://actions.google.com/sounds/v1/weather/thunder_crack.ogg',
    foley_cyber_server: 'https://actions.google.com/sounds/v1/science_fiction/space_station_atmosphere.ogg',
    foley_pneumatic_door: 'https://actions.google.com/sounds/v1/doors/metal_door_open_close.ogg',
    foley_tactical_footsteps: 'https://actions.google.com/sounds/v1/foley/footsteps_wet_pavement.ogg',
    foley_blade_impact: 'https://actions.google.com/sounds/v1/weapons/sword_clash.ogg',
    rain: 'https://actions.google.com/sounds/v1/weather/rain_heavy.ogg',
    wind: 'https://actions.google.com/sounds/v1/weather/thunder_crack.ogg',
    cyber: 'https://actions.google.com/sounds/v1/science_fiction/space_station_atmosphere.ogg'
  };

  // Calculate cumulative scene intervals
  const sceneTimeline = scenes.map((sc, idx) => {
    const dur = sc.duration_seconds || 30;
    const start = scenes.slice(0, idx).reduce((acc, prev) => acc + (prev.duration_seconds || 30), 0);
    return {
      scene: sc,
      start,
      end: start + dur,
      duration: dur
    };
  });

  const totalDurationSeconds = sceneTimeline.length > 0 
    ? sceneTimeline[sceneTimeline.length - 1].end 
    : 180;

  // Determine current active scene based on currentTime
  const currentSceneSegment = sceneTimeline.find(seg => currentTime >= seg.start && currentTime < seg.end) || sceneTimeline[0];
  const currentActiveScene = currentSceneSegment?.scene || scenes[0];

  // Active dialogue line calculation for current active scene
  const sceneRelativeTime = currentSceneSegment ? currentTime - currentSceneSegment.start : 0;
  const sceneFraction = currentSceneSegment ? Math.max(0, Math.min(1, sceneRelativeTime / currentSceneSegment.duration)) : 0;
  const dialogueLines = currentActiveScene?.dialogue || [];
  const activeDialogueIndex = dialogueLines.length > 0 ? Math.min(dialogueLines.length - 1, Math.floor(sceneFraction * dialogueLines.length)) : -1;
  const activeDialogue = activeDialogueIndex >= 0 ? dialogueLines[activeDialogueIndex] : null;

  const timelineDialogueAudioRef = useRef<HTMLAudioElement | null>(null);

  // Real-time Dialogue Speech Playback (Fish Audio / Speech Engine)
  useEffect(() => {
    if (!isPlaying || isMuted || !activeDialogue) {
      setIsSpeaking(false);
      if (timelineDialogueAudioRef.current) {
        timelineDialogueAudioRef.current.pause();
      }
      return;
    }

    const dialogueKey = `${currentActiveScene?.id}_${activeDialogueIndex}_${activeDialogue.line}`;
    if (activeSpokenKeyRef.current !== dialogueKey) {
      activeSpokenKeyRef.current = dialogueKey;

      if (activeDialogue.audio_url) {
        try {
          if (timelineDialogueAudioRef.current) {
            timelineDialogueAudioRef.current.pause();
          }
          const charAudio = new Audio(activeDialogue.audio_url);
          timelineDialogueAudioRef.current = charAudio;
          charAudio.volume = isMuted ? 0 : volume;
          setIsSpeaking(true);
          
          charAudio.play().then(() => {
            setIsSpeaking(true);
          }).catch(() => {
            playTimelineSpeechFallback(activeDialogue);
          });

          charAudio.onended = () => setIsSpeaking(false);
          charAudio.onerror = () => playTimelineSpeechFallback(activeDialogue);
        } catch (e) {
          playTimelineSpeechFallback(activeDialogue);
        }
      } else {
        playTimelineSpeechFallback(activeDialogue);
      }
    }
  }, [activeDialogue, activeDialogueIndex, currentActiveScene?.id, isPlaying, isMuted, volume]);

  const playTimelineSpeechFallback = (dialogueItem: DialogueLine) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(dialogueItem.line);
      
      if (dialogueItem.speaker?.toLowerCase().includes('baritone') || dialogueItem.fish_voice_token?.includes('BARITONE')) {
        utterance.pitch = 0.82;
        utterance.rate = 0.95;
      } else if (dialogueItem.speaker?.toLowerCase().includes('scholar') || dialogueItem.fish_voice_token?.includes('SCHOLAR')) {
        utterance.pitch = 1.05;
        utterance.rate = 1.0;
      } else {
        utterance.pitch = 0.9;
        utterance.rate = 1.02;
      }

      utterance.volume = isMuted ? 0 : volume;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    }
  };

  // Foley Audio Playback Loop (Rain, Wind, Servos - No Music)
  const activePresetKey = (currentActiveScene as any)?.foley_preset || foleyAtmosphere;
  const activeFoleyTrackUrl = FOLEY_TRACKS[activePresetKey] || FOLEY_TRACKS.foley_rain_asphalt;

  useEffect(() => {
    if (isPlaying && !isMuted && activePresetKey !== 'none') {
      if (!foleyAudioRef.current) {
        foleyAudioRef.current = new Audio(activeFoleyTrackUrl);
        foleyAudioRef.current.loop = true;
      } else {
        if (foleyAudioRef.current.src !== activeFoleyTrackUrl) {
          foleyAudioRef.current.src = activeFoleyTrackUrl;
        }
      }
      const targetVol = typeof (currentActiveScene as any)?.foley_volume === 'number'
        ? (currentActiveScene as any).foley_volume
        : foleyVolume;

      foleyAudioRef.current.volume = isMuted ? 0 : targetVol;
      foleyAudioRef.current.play().catch(() => {});
    } else {
      if (foleyAudioRef.current) {
        foleyAudioRef.current.pause();
      }
    }

    return () => {
      if (foleyAudioRef.current) {
        foleyAudioRef.current.pause();
      }
    };
  }, [isPlaying, isMuted, activePresetKey, activeFoleyTrackUrl, foleyVolume, currentActiveScene]);

  // Continuous playback engine
  useEffect(() => {
    if (isPlaying) {
      lastTickTimeRef.current = Date.now();

      const tick = () => {
        const now = Date.now();
        const delta = ((now - lastTickTimeRef.current) / 1000) * playbackRate;
        lastTickTimeRef.current = now;

        setCurrentTime(prev => {
          const next = prev + delta;
          if (next >= totalDurationSeconds) {
            setIsPlaying(false);
            return totalDurationSeconds;
          }
          return next;
        });

        animationFrameRef.current = requestAnimationFrame(tick);
      };

      animationFrameRef.current = requestAnimationFrame(tick);
    } else {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, totalDurationSeconds, playbackRate]);

  const togglePlay = () => {
    if (currentTime >= totalDurationSeconds) {
      setCurrentTime(0);
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentTime(parseFloat(e.target.value));
  };

  const handleSkip = (seconds: number) => {
    setCurrentTime(prev => Math.max(0, Math.min(totalDurationSeconds, prev + seconds)));
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const handleCompileEpisode = async () => {
    setIsCompiling(true);
    try {
      const response = await fetch('/api/projects/compile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          episode_id: activeEpisode?.id,
          burn_srt_subtitles: burnSubtitles,
          bgm_track_id: bgmTrack,
          scenes
        })
      });

      const data = await response.json();
      if (data.success) {
        setCompileReceipt(data);
        onUpdateEpisodeMasterVideo(data.master_video_url);
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    } catch (err) {
      console.error(err);
      alert("Error compiling timeline with serverless FFmpeg engine");
    } finally {
      setIsCompiling(false);
    }
  };

  // Current visual frame
  const currentVisualUrl = currentActiveScene?.video_url || activeEpisode?.master_video_url || scenes.find(s => s.video_url)?.video_url;

  const isVideoUrl = (url: string | undefined): boolean => {
    if (!url) return false;
    return /\.(mp4|webm|mov|m4v)(\?.*)?$/i.test(url) || url.includes('/storage/renders/') || url.includes('gtv-videos-bucket');
  };

  // Kinetic Pan & Zoom animation
  const scaleValue = isPlaying && isCinematicMotion ? 1 + sceneFraction * 0.07 : 1;
  const panX = isPlaying && isCinematicMotion ? Math.sin(sceneFraction * Math.PI) * 1.5 : 0;
  const panY = isPlaying && isCinematicMotion ? Math.cos(sceneFraction * Math.PI * 0.5) * -1 : 0;

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/20 rounded-2xl p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 text-[11px] font-bold rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                STEP 4: TIMELINE COMPILER & CONTINUITY SAVER
              </span>
              <span className="text-xs font-mono text-slate-400">
                Serverless FFmpeg Core Batch Pipeline
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-100 font-['Cinzel',serif]">
              Master 20-Minute Screenplay Timeline Assembly
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Pulls all Seedance 2.5 video clips in <code className="text-emerald-300 font-mono">sceneIndex</code> order, binds them with seamless audio crossfades, overlays the background soundtrack, and burns in SRT dialogue subtitles.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {onBackToSeedance && (
              <button
                onClick={onBackToSeedance}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-semibold transition-colors cursor-pointer"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>← Step 3: Seedance</span>
              </button>
            )}

            <button
              onClick={onSpawnSequel}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
            >
              <Sparkles className="h-4 w-4" />
              <span>Spawn Sequel (Ep 2+)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Master Video Player & Compilation Hub */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (8 cols): Master Video Viewport */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Tv className="h-4 w-4 text-emerald-400" />
                <h3 className="font-bold text-slate-100 text-sm">
                  {activeEpisode?.title || 'Episode 1: The Glass Monolith'} (Master Compilation)
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-emerald-400">
                  {formatTime(currentTime)} / {formatTime(totalDurationSeconds)}
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">
                  4K UHD 24fps
                </span>
              </div>
            </div>

            {/* Master Continuous Video Canvas Container */}
            <div 
              ref={containerRef}
              id="timeline_compiler_master_player"
              className="relative aspect-video rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 flex flex-col justify-between group shadow-2xl select-none"
            >
              {/* Visual Display */}
              <div className="absolute inset-0 overflow-hidden bg-slate-950 flex items-center justify-center">
                {currentVisualUrl ? (
                  <div 
                    className="w-full h-full will-change-transform"
                    style={{
                      transform: `scale(${scaleValue}) translate(${panX}%, ${panY}%)`,
                      transition: isPlaying ? 'transform 0.1s linear' : 'transform 0.4s ease-out'
                    }}
                  >
                    {isVideoUrl(currentVisualUrl) ? (
                      <video
                        src={currentVisualUrl}
                        autoPlay={isPlaying}
                        loop
                        muted={isMuted}
                        playsInline
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <img
                        src={currentVisualUrl}
                        alt="Master Video Canvas"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-8 text-center z-10">
                    <Film className="h-12 w-12 text-slate-700 mb-3 animate-pulse" />
                    <p className="text-sm font-semibold text-slate-300">Ready for Master Concat & FFmpeg Compilation</p>
                    <p className="text-xs text-slate-500 font-mono mt-1">Render scenes in Step 3 or click Compile Master Episode</p>
                  </div>
                )}

                {/* Top Overlay Badges */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10 pointer-events-none">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-slate-950/80 backdrop-blur-md text-[10px] font-mono text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                      EPISODE MASTER • {currentActiveScene ? `SCENE #${currentActiveScene.scene_index}` : 'TIMELINE'}
                    </span>
                    {currentActiveScene && (
                      <span className="px-2 py-0.5 rounded-md bg-slate-950/80 backdrop-blur-md text-[10px] font-mono text-slate-300 border border-slate-800">
                        {currentActiveScene.location_name}
                      </span>
                    )}
                  </div>

                  <span className="px-2 py-0.5 rounded-md bg-slate-950/80 backdrop-blur-md text-[10px] font-mono text-purple-300 border border-purple-500/30">
                    {bgmTrack.replace(/_/g, ' ')}
                  </span>
                </div>

                {/* Center Play Button Overlay on Hover/Pause */}
                {(!isPlaying || currentTime >= totalDurationSeconds) && currentVisualUrl && (
                  <div className="absolute inset-0 bg-slate-950/30 backdrop-blur-[1px] flex items-center justify-center z-10 transition-opacity">
                    <button
                      onClick={togglePlay}
                      className="h-16 w-16 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white flex items-center justify-center shadow-2xl shadow-emerald-600/50 hover:scale-110 active:scale-95 transition-all cursor-pointer"
                      title="Play Continuous Episode"
                    >
                      <Play className="h-7 w-7 ml-1 fill-white" />
                    </button>
                  </div>
                )}

                {/* Dynamic Subtitle Burn-In Banner */}
                {burnSubtitles && activeDialogue && (
                  <div className="absolute bottom-16 left-6 right-6 z-20 flex justify-center pointer-events-none">
                    <div className="max-w-xl bg-slate-950/85 backdrop-blur-md border border-slate-700/80 rounded-xl px-4 py-2 text-center shadow-2xl animate-in fade-in slide-in-from-bottom-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 font-mono block">
                        {activeDialogue.speaker} {activeDialogue.emotion ? `• ${activeDialogue.emotion}` : ''}
                      </span>
                      <p className="text-xs sm:text-sm font-medium text-yellow-300 font-['Cinzel',serif] tracking-wide mt-0.5 text-shadow">
                        "{activeDialogue.line}"
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Master Control Bar */}
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-950 via-slate-950/90 to-transparent p-3 pt-6 z-30 opacity-95 group-hover:opacity-100 transition-opacity space-y-2">
                {/* Scrubber with Scene Break Ticks */}
                <div className="relative flex items-center">
                  <input
                    type="range"
                    min="0"
                    max={totalDurationSeconds}
                    step="0.1"
                    value={currentTime}
                    onChange={handleSeek}
                    className="w-full h-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500 transition-all"
                  />
                  <div 
                    className="absolute top-0 left-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-500 rounded-lg pointer-events-none"
                    style={{ width: `${(currentTime / totalDurationSeconds) * 100}%` }}
                  />
                </div>

                {/* Control Buttons */}
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <button
                      onClick={togglePlay}
                      className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors cursor-pointer"
                      title={isPlaying ? 'Pause' : 'Play Master Episode'}
                    >
                      {isPlaying ? <Pause className="h-4 w-4 fill-white" /> : <Play className="h-4 w-4 fill-white ml-0.5" />}
                    </button>

                    <button
                      onClick={() => handleSkip(-5)}
                      className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                      title="Rewind 5s"
                    >
                      <Rewind className="h-4 w-4" />
                    </button>

                    <button
                      onClick={() => handleSkip(5)}
                      className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                      title="Forward 5s"
                    >
                      <FastForward className="h-4 w-4" />
                    </button>

                    <span className="font-mono text-[11px] text-slate-400 select-none">
                      <span className="text-white font-bold">{formatTime(currentTime)}</span> / {formatTime(totalDurationSeconds)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 sm:gap-3">
                    {/* Cinematic Motion Toggle */}
                    <button
                      onClick={() => setIsCinematicMotion(!isCinematicMotion)}
                      className={`px-2 py-1 rounded text-[10px] font-mono transition-colors cursor-pointer ${
                        isCinematicMotion ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-slate-800 text-slate-400'
                      }`}
                      title="Toggle Dynamic Pan & Zoom Camera Motion"
                    >
                      <Sparkles className="h-3 w-3 inline mr-1" />
                      Motion FX
                    </button>

                    {/* Subtitles Toggle */}
                    <button
                      onClick={() => setBurnSubtitles(!burnSubtitles)}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        burnSubtitles ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'hover:bg-slate-800 text-slate-400'
                      }`}
                      title="Toggle Subtitle Overlay"
                    >
                      <MessageSquare className="h-3.5 w-3.5" />
                    </button>

                    {/* Volume Control */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setIsMuted(!isMuted)}
                        className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                        title={isMuted ? 'Unmute' : 'Mute'}
                      >
                        {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                      </button>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={isMuted ? 0 : volume}
                        onChange={(e) => {
                          setVolume(parseFloat(e.target.value));
                          if (isMuted) setIsMuted(false);
                        }}
                        className="w-14 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500 hidden sm:block"
                      />
                    </div>

                    {/* Fullscreen */}
                    <button
                      onClick={toggleFullscreen}
                      className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                      title="Toggle Fullscreen"
                    >
                      {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-4 text-xs">
                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={burnSubtitles}
                    onChange={(e) => setBurnSubtitles(e.target.checked)}
                    className="rounded accent-emerald-500"
                  />
                  <span>Burn SRT Subtitles</span>
                </label>

                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3 text-emerald-400" />
                    <span>0% Music (Halal)</span>
                  </span>
                  <select
                    value={foleyAtmosphere}
                    onChange={(e) => setFoleyAtmosphere(e.target.value as any)}
                    className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-sky-300 focus:outline-none font-mono"
                    title="Acoustic Foley Atmosphere (No Music)"
                  >
                    <option value="rain">Heavy Rain & Wet Asphalt Foley</option>
                    <option value="wind">Distant Thunder & Wind Gusts</option>
                    <option value="cyber">Quantum Server & Vent Hum</option>
                    <option value="none">Mute Foley Background</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handleCompileEpisode}
                disabled={isCompiling}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition-all disabled:opacity-50 cursor-pointer"
              >
                {isCompiling ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    <span>Executing FFmpeg Demuxer & Mix...</span>
                  </>
                ) : (
                  <>
                    <Film className="h-3.5 w-3.5" />
                    <span>Compile Full 20-Min Episode</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>

        {/* Right Column (4 cols): Continuity Inheritance & Sequel Hub */}
        <div className="lg:col-span-4 space-y-4">
          
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <h3 className="font-bold text-slate-100 text-sm">Long-Term Continuity Vault</h3>
            </div>

            <p className="text-xs text-slate-400">
              AnimeStudio AI preserves all character Soul IDs and 4K environment layouts across the entire series life-cycle.
            </p>

            {/* Preserved Entities Breakdown */}
            <div className="space-y-2 text-xs">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">Art Style Seed:</span>
                <span className="font-mono text-purple-300 text-[11px] truncate max-w-[160px]">
                  {activeSeries?.art_style_seed || 'MAPPA_VIBRANT_CYBERPUNK_CELL_4K'}
                </span>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">Active Characters:</span>
                <span className="font-bold text-slate-200">{characters.length} Vaulted Soul IDs</span>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">4K Keyframe Locations:</span>
                <span className="font-bold text-slate-200">{environments.length} Environments</span>
              </div>
            </div>

            {/* Spawn Sequel Card */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-950/40 to-purple-950/40 border border-indigo-500/30 space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-indigo-400" />
                <span className="font-bold text-xs text-indigo-200">Spawn Sequel Episode</span>
              </div>
              <p className="text-[11px] text-slate-300">
                Create "Episode 2" with zero re-prompting of characters or backgrounds. All assets are automatically inherited!
              </p>
              <button
                onClick={onSpawnSequel}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Initialize Episode { (activeEpisode?.episode_number || 1) + 1 }</span>
              </button>
            </div>

          </div>

          {/* Compilation Output Receipt */}
          {compileReceipt && (
            <div className="bg-slate-900 border border-emerald-500/40 rounded-2xl p-4 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>FFmpeg Master Stitched & Saved!</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
                  Hostinger VPS: 187.127.114.102
                </span>
              </div>
              <p className="text-[11px] text-sky-300 font-mono break-all bg-slate-950 p-2 rounded-lg border border-slate-800">
                {compileReceipt.ffmpeg_pipeline_receipt?.vps_storage_target || compileReceipt.hostinger_vps_master_url || 'http://187.127.114.102/storage/masters/ep_cyber_01_master_4k.mp4'}
              </p>
              <div className="pt-1 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Runtime: {compileReceipt.total_duration_formatted}</span>
                <span className="text-emerald-400 font-bold">4K H.265 HEVC (Direct VPS Origin)</span>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* Multi-Track Interactive Timeline Layout */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-sky-400" />
            <h3 className="font-bold text-slate-100 text-sm">
              Multi-Track Timeline Sequencer ({scenes.length} Scenes)
            </h3>
          </div>

          <div className="text-xs text-slate-400">
            Total Timeline: <strong className="text-slate-200">{formatTime(totalDurationSeconds)}</strong>
          </div>
        </div>

        {/* Timeline Tracks Grid */}
        <div className="space-y-2 bg-slate-950 p-4 rounded-xl border border-slate-800 overflow-x-auto">
          
          {/* TRACK 1: Video Master Chunks */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono uppercase">
              <Film className="h-3 w-3 text-sky-400" />
              <span>Track 1: Seedance 2.5 Video Chunks</span>
            </div>
            
            <div className="flex items-center gap-2 min-w-[700px]">
              {scenes.map((scene) => (
                <div
                  key={scene.id}
                  className="flex-1 bg-sky-950/40 border border-sky-500/40 hover:border-sky-400 p-2.5 rounded-lg transition-all cursor-pointer group relative overflow-hidden"
                  style={{ flexGrow: scene.duration_seconds }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono font-bold text-[11px] text-sky-300">
                      Scene #{scene.scene_index}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">{scene.duration_seconds}s</span>
                  </div>
                  <p className="text-[10px] text-slate-300 truncate font-medium">{scene.location_name}</p>
                  <div className="flex items-center gap-1 mt-1 text-[9px] text-slate-400">
                    <span className="truncate">{scene.characters_present_names?.join(', ') || 'Ren'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* TRACK 2: Fish Speech Audio */}
          <div className="space-y-1 pt-2">
            <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono uppercase">
              <Volume2 className="h-3 w-3 text-emerald-400" />
              <span>Track 2: Fish Speech Voice Lines</span>
            </div>
            
            <div className="flex items-center gap-2 min-w-[700px]">
              {scenes.map((scene) => (
                <div
                  key={scene.id}
                  className="flex-1 bg-emerald-950/40 border border-emerald-500/30 p-2 rounded-lg text-[10px] font-mono text-emerald-300 truncate"
                  style={{ flexGrow: scene.duration_seconds }}
                >
                  {scene.dialogue?.[0]?.speaker ? `🎙️ ${scene.dialogue[0].speaker}` : 'Ambient'}
                </div>
              ))}
            </div>
          </div>

          {/* TRACK 3: BGM Soundtrack */}
          <div className="space-y-1 pt-2">
            <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono uppercase">
              <Music className="h-3 w-3 text-purple-400" />
              <span>Track 3: Master BGM ({bgmTrack})</span>
            </div>
            
            <div className="w-full bg-purple-950/40 border border-purple-500/30 p-2 rounded-lg text-[10px] font-mono text-purple-300 flex items-center justify-between min-w-[700px]">
              <span>🎵 Continuous Orchestral Mix (-18dB speech ducking active)</span>
              <span>Stereo 48kHz</span>
            </div>
          </div>

          {/* TRACK 4: Subtitles */}
          <div className="space-y-1 pt-2">
            <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono uppercase">
              <Subtitles className="h-3 w-3 text-yellow-400" />
              <span>Track 4: Subtitles (SRT Stream)</span>
            </div>
            
            <div className="flex items-center gap-2 min-w-[700px]">
              {scenes.map((scene) => (
                <div
                  key={scene.id}
                  className="flex-1 bg-yellow-950/30 border border-yellow-500/30 p-1.5 rounded text-[10px] font-sans text-yellow-300/90 truncate"
                  style={{ flexGrow: scene.duration_seconds }}
                >
                  {scene.dialogue?.[0]?.line || '...'}
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
