import { relations } from 'drizzle-orm';
import {
  pgTable,
  text,
  timestamp,
  integer,
  jsonb,
  boolean,
  uuid,
  real
} from 'drizzle-orm/pg-core';

// ----------------------------------------------------------------------------
// USERS & AUTH
// ----------------------------------------------------------------------------
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').notNull().unique(),
  password_hash: text('password_hash').notNull(),
  is_verified: boolean('is_verified').default(false).notNull(),
  wallet_balance: real('wallet_balance').default(100.0).notNull(), // Strictly >= 0.00
  subscription_tier: text('subscription_tier').default('FREE').notNull(),
  subscription_status: text('subscription_status').default('INACTIVE').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

export const otp_verifications = pgTable('otp_verifications', {
  id: uuid('id').defaultRandom().primaryKey(),
  user_id: uuid('user_id').references(() => users.id).notNull(),
  otp_code: text('otp_code').notNull(),
  expires_at: timestamp('expires_at').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// ----------------------------------------------------------------------------
// PROJECT: SERIES & EPISODES
// ----------------------------------------------------------------------------
export const series = pgTable('series', {
  id: uuid('id').defaultRandom().primaryKey(),
  user_id: uuid('user_id').references(() => users.id).notNull(),
  title: text('title').notNull(),
  global_lore: text('global_lore').notNull(),
  art_style_seed: text('art_style_seed').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

export const episodes = pgTable('episodes', {
  id: uuid('id').defaultRandom().primaryKey(),
  series_id: uuid('series_id').references(() => series.id).notNull(),
  episode_number: integer('episode_number').notNull(),
  title: text('title').notNull(),
  route: text('route').notNull(), // ProjectRoute enum
  full_script_json: jsonb('full_script_json').notNull(), // ScreenplayData
  master_video_url: text('master_video_url'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// ----------------------------------------------------------------------------
// VAULT: CHARACTERS & ENVIRONMENTS
// ----------------------------------------------------------------------------
export const characters = pgTable('characters', {
  id: uuid('id').defaultRandom().primaryKey(),
  series_id: uuid('series_id').references(() => series.id).notNull(),
  name: text('name').notNull(),
  fish_voice_token: text('fish_voice_token'),
  visual_descriptor: text('visual_descriptor').notNull(),
  master_model_sheet_url: text('master_model_sheet_url'),
  consistency_method: text('consistency_method'),
  reference_images: jsonb('reference_images').default([]).notNull(),
  turnaround_url: text('turnaround_url'),
  turnaround_angles: jsonb('turnaround_angles'),
  outfit_palette: jsonb('outfit_palette'),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

export const environments = pgTable('environments', {
  id: uuid('id').defaultRandom().primaryKey(),
  series_id: uuid('series_id').references(() => series.id).notNull(),
  location_name: text('location_name').notNull(),
  style_descriptor: text('style_descriptor').notNull(),
  master_keyframe_url: text('master_keyframe_url'),
  camera_angles: jsonb('camera_angles').default([]),
  lighting_time: text('lighting_time'),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// ----------------------------------------------------------------------------
// TIMELINE: SCENES
// ----------------------------------------------------------------------------
export const scenes = pgTable('scenes', {
  id: uuid('id').defaultRandom().primaryKey(),
  episode_id: uuid('episode_id').references(() => episodes.id).notNull(),
  environment_id: uuid('environment_id').references(() => environments.id),
  scene_index: integer('scene_index').notNull(),
  action_prompt: text('action_prompt').notNull(),
  video_url: text('video_url'),
  audio_url: text('audio_url'),
  duration_seconds: real('duration_seconds').notNull(),
  location_name: text('location_name'),
  camera_action: text('camera_action'),
  dialogue: jsonb('dialogue'), // DialogueLine[]
  video_extension_count: integer('video_extension_count').default(0),
  rendering_status: text('rendering_status').default('IDLE'),
  render_progress: real('render_progress').default(0.0),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

export const scene_characters = pgTable('scene_characters', {
  scene_id: uuid('scene_id').references(() => scenes.id).notNull(),
  character_id: uuid('character_id').references(() => characters.id).notNull(),
});

// ----------------------------------------------------------------------------
// MANGA ROUTES: CHAPTERS, PAGES, PANELS (Extension)
// ----------------------------------------------------------------------------
export const manga_chapters = pgTable('manga_chapters', {
  id: uuid('id').defaultRandom().primaryKey(),
  episode_id: uuid('episode_id').references(() => episodes.id).notNull(),
  chapter_number: integer('chapter_number').notNull(),
  title: text('title').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

export const manga_pages = pgTable('manga_pages', {
  id: uuid('id').defaultRandom().primaryKey(),
  chapter_id: uuid('chapter_id').references(() => manga_chapters.id).notNull(),
  page_number: integer('page_number').notNull(),
  layout_type: text('layout_type').notNull(),
  image_url: text('image_url'),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

export const manga_panels = pgTable('manga_panels', {
  id: uuid('id').defaultRandom().primaryKey(),
  page_id: uuid('page_id').references(() => manga_pages.id).notNull(),
  panel_index: integer('panel_index').notNull(),
  action_prompt: text('action_prompt').notNull(),
  speech_text: text('speech_text'),
  bubble_style: text('bubble_style'),
  image_url: text('image_url'),
  created_at: timestamp('created_at').defaultNow().notNull(),
});
