import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  Minimize2, 
  FastForward, 
  Rewind, 
  Sparkles, 
  MessageSquare,
  Sliders,
  Film,
  Zap,
  Mic,
  Wind,
  ShieldCheck,
  Activity
} from 'lucide-react';
import { Scene, DialogueLine, Character } from '../types';

interface SceneMediaPlayerProps {
  scene: Scene;
  characters?: Character[];
  seriesTitle?: string;
  artStyleSeed?: string;
  autoPlay?: boolean;
  onEnded?: () => void;
  showSubtitleBurnIn?: boolean;
}

export const SceneMediaPlayer: React.FC<SceneMediaPlayerProps> = ({
  scene,
  characters = [],
  seriesTitle,
  artStyleSeed,
  autoPlay = false,
  onEnded,
  showSubtitleBurnIn = true
}) => {
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(scene.duration_seconds || 30);
  const [voiceVolume, setVoiceVolume] = useState(0.9);
  const [foleyVolume, setFoleyVolume] = useState(0.6);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isKineticMotion, setIsKineticMotion] = useState(true);
  const [showSubtitles, setShowSubtitles] = useState(showSubtitleBurnIn);
  const [activeFoleyPreset, setActiveFoleyPreset] = useState<'rain' | 'wind' | 'cyber' | 'none'>('rain');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [characterActionPose, setCharacterActionPose] = useState<'idle' | 'combat' | 'speaking' | 'stride'>('idle');

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoElementRef = useRef<HTMLVideoElement>(null);
  const foleyAudioRef = useRef<HTMLAudioElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastTickTimeRef = useRef<number>(Date.now());
  const activeSpokenIndexRef = useRef<number>(-1);

  // Check if video_url is a real video file (mp4, webm, apiframe video stream)
  const isDirectVideo = Boolean(
    scene.video_url && 
    (
      scene.video_url.includes('.mp4') || 
      scene.video_url.includes('.webm') || 
      scene.video_url.includes('.mov') ||
      scene.video_url.includes('/video') ||
      scene.video_url.includes('videos/') ||
      scene.video_url.includes('apiframe') ||
      scene.video_url.includes('gtv-videos-bucket') ||
      (!scene.video_url.startsWith('data:image') && !scene.video_url.match(/\.(png|jpe?g|webp)(\?.*)?$/i))
    )
  );

  // Foley SFX Tracks (100% Halal - Zero Musical Instruments)
  const FOLEY_TRACKS: Record<string, string> = {
    rain: 'https://actions.google.com/sounds/v1/weather/rain_heavy.ogg',
    wind: 'https://actions.google.com/sounds/v1/weather/thunder_crack.ogg',
    cyber: 'https://actions.google.com/sounds/v1/science_fiction/space_station_atmosphere.ogg'
  };

  // Sync duration on scene change
  useEffect(() => {
    setDuration(scene.duration_seconds || 30);
    setCurrentTime(0);
    setIsPlaying(false);
    activeSpokenIndexRef.current = -1;
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }, [scene.id, scene.duration_seconds]);

  // Video playback synchronization (Mutes raw video native BGM, syncs play/pause & seek)
  useEffect(() => {
    const vid = videoElementRef.current;
    if (!vid || !isDirectVideo) return;

    vid.muted = true; // Strip out unwanted AI-generated background music
    if (isPlaying) {
      vid.playbackRate = playbackRate;
      vid.play().catch(() => {});
    } else {
      vid.pause();
    }
  }, [isPlaying, isDirectVideo, playbackRate]);

  useEffect(() => {
    const vid = videoElementRef.current;
    if (!vid || !isDirectVideo) return;
    const effectiveDur = vid.duration || duration || 8;
    const targetTime = effectiveDur > 0 ? currentTime % effectiveDur : currentTime;
    if (Math.abs(vid.currentTime - targetTime) > 0.4) {
      try {
        vid.currentTime = targetTime;
      } catch (e) {}
    }
  }, [currentTime, isDirectVideo, duration]);

  // Handle Foley Audio Playback
  useEffect(() => {
    if (isPlaying && !isMuted && activeFoleyPreset !== 'none') {
      if (!foleyAudioRef.current) {
        foleyAudioRef.current = new Audio(FOLEY_TRACKS[activeFoleyPreset] || FOLEY_TRACKS.rain);
        foleyAudioRef.current.loop = true;
      } else {
        foleyAudioRef.current.src = FOLEY_TRACKS[activeFoleyPreset] || FOLEY_TRACKS.rain;
      }
      foleyAudioRef.current.volume = isMuted ? 0 : foleyVolume;
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
  }, [isPlaying, isMuted, activeFoleyPreset, foleyVolume]);

  // Dialogue timing calculations
  const dialogueLines = scene.dialogue || [];
  const currentFraction = duration > 0 ? currentTime / duration : 0;
  const activeDialogueIndex = dialogueLines.length > 0 
    ? Math.min(dialogueLines.length - 1, Math.floor(currentFraction * dialogueLines.length)) 
    : -1;
  const activeDialogue = activeDialogueIndex >= 0 ? dialogueLines[activeDialogueIndex] : null;

  const dialogueAudioRef = useRef<HTMLAudioElement | null>(null);

  // Speak character dialogue in real-time when reaching dialogue segment (Fish Audio TTS / Speech Engine)
  useEffect(() => {
    if (!isPlaying || isMuted || activeDialogueIndex === -1 || !activeDialogue) {
      setIsSpeaking(false);
      if (dialogueAudioRef.current) {
        dialogueAudioRef.current.pause();
      }
      return;
    }

    if (activeDialogueIndex !== activeSpokenIndexRef.current) {
      activeSpokenIndexRef.current = activeDialogueIndex;

      // 1. If active dialogue has an explicit audio_url (Fish Audio data URL or remote MP3), play it
      if (activeDialogue.audio_url) {
        try {
          if (dialogueAudioRef.current) {
            dialogueAudioRef.current.pause();
          }
          const charAudio = new Audio(activeDialogue.audio_url);
          dialogueAudioRef.current = charAudio;
          charAudio.volume = isMuted ? 0 : voiceVolume;
          setIsSpeaking(true);
          
          charAudio.play().then(() => {
            setIsSpeaking(true);
          }).catch((err) => {
            console.warn("Audio playback note:", err);
            // If browser autoplay restrictions trigger, fallback to speech synthesis
            playSpeechSynthesisFallback(activeDialogue);
          });

          charAudio.onended = () => {
            setIsSpeaking(false);
          };
          charAudio.onerror = () => {
            playSpeechSynthesisFallback(activeDialogue);
          };
        } catch (e) {
          playSpeechSynthesisFallback(activeDialogue);
        }
      } else {
        // 2. High fidelity speech synthesis fallback
        playSpeechSynthesisFallback(activeDialogue);
      }
    }
  }, [activeDialogueIndex, isPlaying, isMuted, voiceVolume, activeDialogue]);

  const playSpeechSynthesisFallback = (dialogueItem: DialogueLine) => {
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

      utterance.volume = isMuted ? 0 : voiceVolume;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    }
  };

  // Main Animation / Progress Timer
  useEffect(() => {
    if (isPlaying) {
      lastTickTimeRef.current = Date.now();

      const tick = () => {
        const now = Date.now();
        const delta = ((now - lastTickTimeRef.current) / 1000) * playbackRate;
        lastTickTimeRef.current = now;

        setCurrentTime(prev => {
          const next = prev + delta;
          if (next >= duration) {
            setIsPlaying(false);
            if (onEnded) onEnded();
            return duration;
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
  }, [isPlaying, duration, playbackRate]);

  // Dynamic 24fps Particle & Kinetic Motion Canvas Renderer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let frameCount = 0;

    // Rain / cyber particles
    const particles = Array.from({ length: 45 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      speed: 4 + Math.random() * 8,
      length: 12 + Math.random() * 18,
      opacity: 0.15 + Math.random() * 0.35
    }));

    const renderCanvas = () => {
      frameCount++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (isPlaying && isKineticMotion) {
        // Draw kinetic rain / atmospheric streak lines
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
        ctx.lineWidth = 1.2;

        particles.forEach(p => {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(186, 230, 253, ${p.opacity})`;
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x - 3, p.y + p.length);
          ctx.stroke();

          p.y += p.speed;
          p.x -= 1.5;

          if (p.y > canvas.height) {
            p.y = -20;
            p.x = Math.random() * (canvas.width + 100);
          }
        });

        // Kinetic action speed lines when approaching climax or speaking
        if (isSpeaking || currentTime % 6 < 3) {
          ctx.fillStyle = 'rgba(14, 165, 233, 0.08)';
          for (let i = 0; i < 4; i++) {
            const x = (frameCount * 8 + i * 200) % (canvas.width + 200) - 100;
            ctx.fillRect(x, 0, 40, canvas.height);
          }
        }
      }

      animId = requestAnimationFrame(renderCanvas);
    };

    renderCanvas();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [isPlaying, isKineticMotion, isSpeaking, currentTime]);

  const togglePlay = () => {
    if (currentTime >= duration) {
      setCurrentTime(0);
      activeSpokenIndexRef.current = -1;
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const target = parseFloat(e.target.value);
    setCurrentTime(target);
    activeSpokenIndexRef.current = -1;
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  };

  const handleSkip = (seconds: number) => {
    setCurrentTime(prev => Math.max(0, Math.min(duration, prev + seconds)));
    activeSpokenIndexRef.current = -1;
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    const ms = Math.floor((secs % 1) * 10);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms}`;
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

  // Kinetic Parallax & Motion Transforms
  const progressRatio = duration > 0 ? currentTime / duration : 0;
  const cameraZoom = isPlaying && isKineticMotion ? 1.03 + Math.sin(progressRatio * Math.PI) * 0.06 : 1;
  const cameraPanX = isPlaying && isKineticMotion ? Math.sin(progressRatio * Math.PI * 2) * 1.8 : 0;
  const cameraPanY = isPlaying && isKineticMotion ? Math.cos(progressRatio * Math.PI * 1.5) * -1.2 : 0;

  // Character Sprite Animation (Breathing & Lip movement oscillation)
  const charBreathY = isPlaying ? Math.sin(currentTime * 3) * 3 : 0;
  const charMouthOpen = isSpeaking ? (Math.sin(currentTime * 18) > 0) : false;

  return (
    <div 
      ref={containerRef}
      id={`media_player_scene_${scene.id}`}
      className="relative aspect-video rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 flex flex-col justify-between group shadow-2xl select-none"
    >
      {/* Background Visual Layer */}
      <div className="absolute inset-0 overflow-hidden bg-slate-950 flex items-center justify-center">
        {scene.video_url ? (
          isDirectVideo ? (
            <video
              ref={videoElementRef}
              src={scene.video_url}
              className="w-full h-full object-cover"
              loop
              playsInline
              muted={true}
              onLoadedMetadata={(e) => {
                const vid = e.currentTarget;
                if (vid.duration && vid.duration > 0 && Math.abs(vid.duration - duration) > 1) {
                  setDuration(Math.round(vid.duration * 10) / 10);
                }
              }}
            />
          ) : (
            <div 
              className="w-full h-full relative overflow-hidden"
              style={{
                transform: `scale(${cameraZoom}) translate(${cameraPanX}%, ${cameraPanY}%)`,
                transition: isPlaying ? 'transform 0.1s linear' : 'transform 0.4s ease-out'
              }}
            >
              {/* Environment Plate */}
              <img
                src={scene.video_url}
                alt={scene.action_prompt || 'Scene Render'}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />

              {/* 2.5D Animated Character Layer with Kinetic Physics */}
              {isKineticMotion && (
                <div 
                  className="absolute inset-0 pointer-events-none flex items-end justify-center pb-8"
                  style={{
                    transform: `translateY(${charBreathY}px)`,
                    transition: 'transform 0.05s ease-out'
                  }}
                >
                  {/* Dynamic Speaking / Action Aura */}
                  {isSpeaking && (
                    <div className="absolute bottom-20 w-48 h-48 rounded-full bg-sky-500/10 blur-2xl animate-pulse pointer-events-none" />
                  )}
                </div>
              )}
            </div>
          )
        ) : (
          <div className="text-center p-6 space-y-2 z-10">
            <Film className="h-10 w-10 text-slate-700 mx-auto animate-pulse" />
            <p className="text-xs font-semibold text-slate-400">Seedance 2.5 Multi-Reference Render Pending</p>
            <span className="text-[10px] font-mono text-slate-600 block">Click 'Render Scene' below to generate 24fps animated sequence</span>
          </div>
        )}

        {/* 24fps Particle Overlay Canvas */}
        <canvas
          ref={canvasRef}
          width={800}
          height={450}
          className="absolute inset-0 w-full h-full pointer-events-none z-10 mix-blend-screen"
        />

        {/* Top Badges & Status */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-20 pointer-events-none">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md bg-slate-950/85 backdrop-blur-md text-[10px] font-mono text-sky-400 border border-sky-500/30 flex items-center gap-1.5 shadow-lg">
              <span className={`h-1.5 w-1.5 rounded-full ${isPlaying ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`} />
              SCENE #{scene.scene_index}
            </span>
            <span className="px-2 py-0.5 rounded-md bg-slate-950/85 backdrop-blur-md text-[10px] font-mono text-slate-300 border border-slate-800">
              {scene.location_name || 'Neo-Kyoto'}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Halal Audio Badge */}
            <span className="px-2 py-0.5 rounded-md bg-slate-950/85 backdrop-blur-md text-[10px] font-mono text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
              <ShieldCheck className="h-3 w-3 text-emerald-400" />
              <span>Voice & Foley Only (0% Music)</span>
            </span>

            {isSpeaking && (
              <span className="px-2 py-0.5 rounded-md bg-sky-950/90 backdrop-blur-md text-[10px] font-mono text-sky-300 border border-sky-500/50 flex items-center gap-1 animate-pulse">
                <Mic className="h-3 w-3 text-sky-400 animate-bounce" />
                <span>Fish Voice Active</span>
              </span>
            )}
          </div>
        </div>

        {/* Center Play Overlay when Paused */}
        {scene.video_url && (!isPlaying || currentTime >= duration) && (
          <div className="absolute inset-0 bg-slate-950/35 backdrop-blur-[1px] flex items-center justify-center z-20 transition-opacity">
            <button
              onClick={togglePlay}
              className="h-16 w-16 rounded-full bg-gradient-to-tr from-sky-600 to-rose-600 hover:from-sky-500 hover:to-rose-500 text-white flex items-center justify-center shadow-2xl shadow-rose-600/50 hover:scale-110 active:scale-95 transition-all cursor-pointer"
              title="Play Animated Scene"
            >
              <Play className="h-7 w-7 ml-1 fill-white" />
            </button>
          </div>
        )}

        {/* Subtitle Burn-In Banner with Live Speaker Indicator & Speaker Lip Sync Avatar */}
        {showSubtitles && activeDialogue && scene.video_url && (
          <div className="absolute bottom-16 left-6 right-6 z-20 flex justify-center pointer-events-none">
            <div className="max-w-2xl w-full bg-slate-950/90 backdrop-blur-md border border-slate-700/80 rounded-xl p-3 shadow-2xl animate-in fade-in slide-in-from-bottom-1 flex items-center gap-4">
              
              {/* Speakers Lip Sync Avatar Picture-in-Picture */}
              {(() => {
                const speakingChar = characters?.find(
                  c => c.name.toLowerCase() === activeDialogue.speaker.toLowerCase()
                );
                const avatarUrl = speakingChar?.reference_images?.[0] || speakingChar?.turnaround_url;
                if (!avatarUrl) return null;

                return (
                  <div className="relative h-12 w-12 rounded-lg overflow-hidden border border-slate-700/60 bg-slate-950 flex-shrink-0">
                    <img 
                      src={avatarUrl} 
                      alt={activeDialogue.speaker} 
                      className="h-full w-full object-cover transform scale-110"
                      style={{
                        transform: `translateY(${charBreathY}px) scale(1.15)`
                      }}
                      referrerPolicy="no-referrer"
                    />
                    
                    {/* Dynamic AV Lip Sync Indicator Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end justify-center pb-0.5">
                      <div className="px-1 rounded bg-rose-950/90 border border-rose-500/40 text-[6px] font-mono font-bold text-rose-300 scale-90">
                        AV SYNC
                      </div>
                    </div>

                    {/* Animated Mouth Shape Layer */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div 
                        className="bg-rose-500 rounded-full transition-all duration-75 border border-rose-300"
                        style={{
                          width: charMouthOpen ? '8px' : '5px',
                          height: charMouthOpen ? '5px' : '1px',
                          opacity: isSpeaking ? 0.95 : 0,
                          transform: `scale(${charMouthOpen ? 1.3 : 0.8})`,
                          boxShadow: charMouthOpen ? '0 0 5px rgba(244, 63, 94, 0.95)' : 'none'
                        }}
                      />
                    </div>
                  </div>
                );
              })()}

              <div className="flex-1 text-left min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <Mic className="h-3 w-3 text-sky-400" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400 font-mono">
                    {activeDialogue.speaker} {activeDialogue.emotion ? `• ${activeDialogue.emotion}` : ''}
                  </span>
                  {isSpeaking && (
                    <span className="text-[8px] font-mono text-emerald-400 animate-pulse bg-emerald-950/60 px-1 py-0.2 rounded border border-emerald-500/20">
                      LIPS ACTIVE
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-sm font-medium text-slate-100 font-['Cinzel',serif] tracking-wide truncate sm:whitespace-normal line-clamp-2">
                  "{activeDialogue.line}"
                </p>
              </div>

            </div>
          </div>
        )}
      </div>

      {/* Control Bar */}
      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-950 via-slate-950/90 to-transparent p-3 pt-6 z-30 opacity-95 group-hover:opacity-100 transition-opacity space-y-2">
        {/* Scrubber Bar */}
        <div className="relative flex items-center">
          <input
            type="range"
            min="0"
            max={duration}
            step="0.1"
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-500 transition-all"
          />
          {/* Progress fill visual overlay */}
          <div 
            className="absolute top-0 left-0 h-1.5 bg-gradient-to-r from-sky-500 to-rose-500 rounded-lg pointer-events-none"
            style={{ width: `${(currentTime / duration) * 100}%` }}
          />
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between text-xs text-slate-300">
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={togglePlay}
              disabled={!scene.video_url}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition-colors cursor-pointer disabled:opacity-40"
              title={isPlaying ? 'Pause' : 'Play'}
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

            {/* Time Stamp */}
            <span className="font-mono text-[11px] text-slate-400 ml-1">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          {/* Sound API Controls & Foley Mix */}
          <div className="flex items-center gap-3">
            {/* Foley Atmosphere Selector */}
            <div className="flex items-center gap-1 bg-slate-900/90 border border-slate-800 px-2 py-1 rounded-lg text-[10px] font-mono">
              <Wind className="h-3 w-3 text-sky-400" />
              <select
                value={activeFoleyPreset}
                onChange={(e) => setActiveFoleyPreset(e.target.value as any)}
                className="bg-transparent text-slate-300 focus:outline-none cursor-pointer"
                title="Acoustic Foley SFX (No Music)"
              >
                <option value="rain">Rain Foley</option>
                <option value="wind">Wind & Thunder</option>
                <option value="cyber">Server Hum</option>
                <option value="none">Foley Muted</option>
              </select>
            </div>

            {/* Voice & Master Mute */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className={`p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer ${isMuted ? 'text-rose-400' : 'text-slate-300'}`}
                title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
              >
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </button>

              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : voiceVolume}
                onChange={(e) => {
                  setVoiceVolume(parseFloat(e.target.value));
                  if (isMuted) setIsMuted(false);
                }}
                className="w-14 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
                title="Voice & Dialogue Volume"
              />
            </div>

            {/* Kinetic FX Toggle */}
            <button
              onClick={() => setIsKineticMotion(!isKineticMotion)}
              className={`px-2 py-1 rounded-md text-[10px] font-mono transition-colors border cursor-pointer ${
                isKineticMotion 
                  ? 'bg-sky-500/20 text-sky-300 border-sky-500/40' 
                  : 'bg-slate-900 text-slate-500 border-slate-800'
              }`}
              title="Toggle Kinetic Anime Character Motion"
            >
              24fps Motion
            </button>

            {/* Subtitles Toggle */}
            <button
              onClick={() => setShowSubtitles(!showSubtitles)}
              className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                showSubtitles 
                  ? 'bg-purple-500/20 text-purple-300 border-purple-500/40' 
                  : 'bg-slate-900 text-slate-500 border-slate-800'
              }`}
              title="Toggle Subtitle Burn-In"
            >
              <MessageSquare className="h-4 w-4" />
            </button>

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
