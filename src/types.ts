export type ProjectRoute = 'FULL_EPISODE' | 'SHORT_FORM';

export interface User {
  id: string;
  email: string;
  wallet_balance: number; // Strictly >= 0.00
  created_at: string;
}

export interface Series {
  id: string;
  user_id: string;
  title: string;
  global_lore: string;
  art_style_seed: string; // e.g. "SHINKAI_4K_VIBRANT_CELL" | "MAPPA_DARK_FANTASY_CYBER"
  created_at: string;
  updated_at: string;
}

export interface DialogueLine {
  id?: string;
  speaker: string;
  character_id?: string;
  line: string;
  emotion?: string;
  fish_voice_token?: string;
  audio_url?: string;
  duration_seconds?: number;
}

export interface ScriptSceneData {
  scene_index: number;
  location_name: string;
  characters_present: string[];
  action_prompt: string;
  camera_action: string;
  estimated_duration: number;
  dialogue: DialogueLine[];
  lighting_mood?: string;
  sound_effects?: string;
}

export interface ScreenplayData {
  logline: string;
  synopsis: string;
  target_runtime_minutes: number;
  route: ProjectRoute;
  scenes: ScriptSceneData[];
}

export interface Episode {
  id: string;
  series_id: string;
  episode_number: number;
  title: string;
  route: ProjectRoute;
  full_script_json: ScreenplayData;
  master_video_url?: string;
  created_at: string;
  updated_at: string;
}

export interface CharacterTurnaroundAngles {
  front?: string;
  threeQuarter?: string;
  profile?: string;
  back?: string;
  expression?: string;
}

export interface Character {
  id: string;
  series_id: string;
  name: string;
  fish_voice_token: string;
  visual_descriptor: string;
  master_model_sheet_url?: string;
  consistency_method?: 'UNIFIED_MASTER_SHEET' | 'MULTI_REFERENCE_ANCHOR';
  reference_images: string[]; // Front, 3/4, Side, Profile, Outfit, Expressions
  turnaround_url?: string;
  turnaround_angles?: CharacterTurnaroundAngles;
  outfit_palette?: string[];
  created_at: string;
}

export interface Environment {
  id: string;
  series_id: string;
  location_name: string;
  style_descriptor: string;
  master_keyframe_url: string; // Static 4K HunyuanImage output
  camera_angles?: string[];
  lighting_time?: string;
  created_at: string;
}

export interface Scene {
  id: string;
  episode_id: string;
  environment_id?: string;
  scene_index: number;
  action_prompt: string;
  video_url?: string;
  audio_url?: string;
  duration_seconds: number;
  created_at: string;
  updated_at: string;
  // Denormalized/Joined properties for studio workflow
  location_name?: string;
  characters_present_ids?: string[];
  characters_present_names?: string[];
  camera_action?: string;
  dialogue?: DialogueLine[];
  video_extension_count?: number;
  rendering_status?: 'IDLE' | 'QUEUED' | 'GENERATING_ASSETS' | 'SEEDANCE_RENDERING' | 'COMPLETED' | 'FAILED';
  render_progress?: number;
}

export interface SceneCharacter {
  scene_id: string;
  character_id: string;
}

export interface SeedancePayload {
  prompt: string;
  image_references: {
    lane_1_environment_keyframe: {
      url: string;
      weight: number;
      perspective_lock: boolean;
      lighting_grid_sync: boolean;
    };
    lane_2_character_turnarounds: Array<{
      character_id: string;
      name: string;
      turnaround_urls: string[];
      weight: number;
      feature_anchors: string[];
    }>;
  };
  audio_ref: {
    url: string;
    format: string;
    sync_mode: 'JOINT_AUDIO_VISUAL_LIP_JAW';
    speech_energy_boost: boolean;
  };
  duration_settings: {
    base_duration_seconds: number;
    video_extension: {
      enabled: boolean;
      extension_target_seconds: number;
      temporal_coherence_guard: boolean;
      anti_background_flicker: boolean;
    };
    fps: number;
    resolution: '4K_UHD' | '1080P_HD';
    aspect_ratio: '16:9' | '9:16';
  };
  volcano_engine_config: {
    model_version: 'Seedance-2.5-Extended';
    pipeline_mode: 'ENTERPRISE_ASYNC_QUEUE';
    priority: 'HIGH';
    seed: number;
  };
}

export interface FullProjectState {
  user: User;
  series: Series[];
  episodes: Episode[];
  characters: Character[];
  environments: Environment[];
  scenes: Scene[];
  scene_characters: SceneCharacter[];
  active_series_id: string;
  active_episode_id: string;
}
