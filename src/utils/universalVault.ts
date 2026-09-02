import { Series, Episode, Character, Environment, Scene } from '../types';
import { MangaPageRecord, MangaPanel } from '../components/MangaStudioTab';

export interface UniversalPanelItem {
  id: string;
  seriesId: string;
  seriesTitle?: string;
  chapterNumber: number;
  pageNumber: number;
  panelIndex: number;
  imageUrl: string;
  actionPrompt: string;
  speechText?: string;
  bubbleStyle?: string;
  bubbleX?: number;
  bubbleY?: number;
  bubbleScale?: number;
  layoutClass?: string;
  charactersPresent?: string[];
  createdAt: string;
}

export interface UniversalProjectSummary {
  id: string;
  seriesId: string;
  title: string;
  lore: string;
  artStyle: string;
  route: string;
  episodeId: string;
  episodeTitle: string;
  pageCount: number;
  panelCount: number;
  characterCount: number;
  environmentCount: number;
  lastModified: string;
  previewThumbnail?: string;
}

// Local storage key constants
const VAULT_KEYS = {
  PROJECT_PREFIX: 'ais_vault_project_',
  ALL_PROJECTS: 'ais_vault_all_projects',
  UNIVERSAL_PANELS: 'ais_vault_universal_panels',
  UNIVERSAL_CHARACTERS: 'ais_vault_universal_characters',
  UNIVERSAL_ENVIRONMENTS: 'ais_vault_universal_environments',
  ACTIVE_PROJECT_ID: 'ais_vault_active_project_id'
};

/**
 * Universal Database & Storage Vault Engine
 * Seamlessly manages multi-project persistence, universal panel indexing,
 * cross-story character/environment libraries, and live PostgreSQL cloud synchronization.
 */
export const UniversalVault = {
  /**
   * Save a single generated panel to the Universal Panels Vault & PostgreSQL database
   */
  async savePanel(
    panel: MangaPanel,
    pageNumber: number,
    chapterNumber: number = 1,
    seriesId: string = 'ser_default',
    seriesTitle: string = 'Manga Story'
  ): Promise<UniversalPanelItem> {
    const item: UniversalPanelItem = {
      id: panel.id || `pnl_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      seriesId,
      seriesTitle,
      chapterNumber,
      pageNumber,
      panelIndex: panel.panelIndex || 1,
      imageUrl: panel.imageUrl || '',
      actionPrompt: panel.actionPrompt || '',
      speechText: panel.speechText || '',
      bubbleStyle: panel.bubbleStyle || 'oval',
      bubbleX: panel.bubbleX ?? 50,
      bubbleY: panel.bubbleY ?? 40,
      bubbleScale: panel.bubbleScale ?? 1.0,
      layoutClass: panel.layoutClass || 'col-span-6 row-span-1 h-64',
      charactersPresent: panel.charactersPresent || [],
      createdAt: new Date().toISOString()
    };

    // 1. Cache to local Universal Panels array
    try {
      const existingStr = localStorage.getItem(VAULT_KEYS.UNIVERSAL_PANELS);
      const list: UniversalPanelItem[] = existingStr ? JSON.parse(existingStr) : [];
      const filtered = list.filter(p => p.id !== item.id);
      filtered.unshift(item);
      // Keep up to 200 most recent panels locally
      localStorage.setItem(VAULT_KEYS.UNIVERSAL_PANELS, JSON.stringify(filtered.slice(0, 200)));
    } catch (e) {
      console.warn("LocalStorage panel cache warning:", e);
    }

    // 2. Dispatch to backend database vault
    try {
      fetch('/api/vault/panels/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
      }).catch(err => console.warn("Backend panel save notice:", err));
    } catch (err) {
      console.warn("Panel save network notice:", err);
    }

    return item;
  },

  /**
   * Retrieve all universal panels across all projects and pages
   */
  async getAllPanels(): Promise<UniversalPanelItem[]> {
    let localPanels: UniversalPanelItem[] = [];
    try {
      const existingStr = localStorage.getItem(VAULT_KEYS.UNIVERSAL_PANELS);
      if (existingStr) {
        localPanels = JSON.parse(existingStr);
      }
    } catch (e) {}

    try {
      const res = await fetch('/api/vault/panels');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.panels) && data.panels.length > 0) {
          // Merge with local panels prioritizing newest
          const map = new Map<string, UniversalPanelItem>();
          [...data.panels, ...localPanels].forEach(p => {
            if (p.id && (!map.has(p.id) || !map.get(p.id)?.imageUrl)) {
              map.set(p.id, p);
            }
          });
          const merged = Array.from(map.values());
          localStorage.setItem(VAULT_KEYS.UNIVERSAL_PANELS, JSON.stringify(merged.slice(0, 200)));
          return merged;
        }
      }
    } catch (err) {
      console.warn("Remote panels vault fetch notice:", err);
    }

    return localPanels;
  },

  /**
   * Save a character to the Universal Character Vault across all projects
   */
  async saveCharacter(char: Character): Promise<Character> {
    try {
      const existingStr = localStorage.getItem(VAULT_KEYS.UNIVERSAL_CHARACTERS);
      const list: Character[] = existingStr ? JSON.parse(existingStr) : [];
      const filtered = list.filter(c => c.id !== char.id);
      filtered.unshift(char);
      localStorage.setItem(VAULT_KEYS.UNIVERSAL_CHARACTERS, JSON.stringify(filtered.slice(0, 100)));
    } catch (e) {}

    try {
      fetch('/api/vault/characters/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ character: char })
      }).catch(err => console.warn("Backend char save notice:", err));
    } catch (err) {}

    return char;
  },

  /**
   * Retrieve all characters from Universal Vault
   */
  async getAllCharacters(): Promise<Character[]> {
    let localChars: Character[] = [];
    try {
      const existingStr = localStorage.getItem(VAULT_KEYS.UNIVERSAL_CHARACTERS);
      if (existingStr) localChars = JSON.parse(existingStr);
    } catch (e) {}

    try {
      const res = await fetch('/api/vault/characters');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.characters) && data.characters.length > 0) {
          const map = new Map<string, Character>();
          [...data.characters, ...localChars].forEach(c => {
            if (c.id && !map.has(c.id)) map.set(c.id, c);
          });
          const merged = Array.from(map.values());
          localStorage.setItem(VAULT_KEYS.UNIVERSAL_CHARACTERS, JSON.stringify(merged.slice(0, 100)));
          return merged;
        }
      }
    } catch (e) {}

    return localChars;
  },

  /**
   * Save an environment/stage to Universal Vault
   */
  async saveEnvironment(env: Environment): Promise<Environment> {
    try {
      const existingStr = localStorage.getItem(VAULT_KEYS.UNIVERSAL_ENVIRONMENTS);
      const list: Environment[] = existingStr ? JSON.parse(existingStr) : [];
      const filtered = list.filter(e => e.id !== env.id);
      filtered.unshift(env);
      localStorage.setItem(VAULT_KEYS.UNIVERSAL_ENVIRONMENTS, JSON.stringify(filtered.slice(0, 100)));
    } catch (e) {}

    try {
      fetch('/api/vault/environments/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ environment: env })
      }).catch(err => console.warn("Backend env save notice:", err));
    } catch (err) {}

    return env;
  },

  /**
   * Retrieve all environments from Universal Vault
   */
  async getAllEnvironments(): Promise<Environment[]> {
    let localEnvs: Environment[] = [];
    try {
      const existingStr = localStorage.getItem(VAULT_KEYS.UNIVERSAL_ENVIRONMENTS);
      if (existingStr) localEnvs = JSON.parse(existingStr);
    } catch (e) {}

    try {
      const res = await fetch('/api/vault/environments');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.environments) && data.environments.length > 0) {
          const map = new Map<string, Environment>();
          [...data.environments, ...localEnvs].forEach(e => {
            if (e.id && !map.has(e.id)) map.set(e.id, e);
          });
          const merged = Array.from(map.values());
          localStorage.setItem(VAULT_KEYS.UNIVERSAL_ENVIRONMENTS, JSON.stringify(merged.slice(0, 100)));
          return merged;
        }
      }
    } catch (e) {}

    return localEnvs;
  },

  /**
   * Save entire project with all pages, panels, layout order, characters, and environments
   */
  async saveProject({
    series,
    episode,
    pages,
    characters = [],
    environments = [],
    scenes = []
  }: {
    series: Series;
    episode: Episode;
    pages: MangaPageRecord[];
    characters?: Character[];
    environments?: Environment[];
    scenes?: Scene[];
  }): Promise<{ success: boolean; timestamp: string }> {
    if (!series || !series.id) {
      return { success: false, timestamp: new Date().toISOString() };
    }

    const payload = {
      series,
      episode,
      pages,
      characters,
      environments,
      scenes,
      lastModified: new Date().toISOString()
    };

    // 1. Instant local persistence for zero-latency editing anywhere
    try {
      localStorage.setItem(`${VAULT_KEYS.PROJECT_PREFIX}${series.id}`, JSON.stringify(payload));
      localStorage.setItem(VAULT_KEYS.ACTIVE_PROJECT_ID, series.id);

      // Find first rendered panel or page image for thumbnail preview
      let previewThumbnail = '';
      for (const pg of pages) {
        if (pg.pageImageObj) {
          previewThumbnail = pg.pageImageObj;
          break;
        }
        for (const p of pg.panels) {
          if (p.imageUrl) {
            previewThumbnail = p.imageUrl;
            break;
          }
        }
        if (previewThumbnail) break;
      }

      // Calculate total panels
      const totalPanels = pages.reduce((acc, p) => acc + (p.panels?.length || 0), 0);

      // Update project summary in projects index
      const summary: UniversalProjectSummary = {
        id: series.id,
        seriesId: series.id,
        title: series.title || 'Untitled Manga Story',
        lore: series.global_lore || '',
        artStyle: series.art_style_seed || 'GEKIGA_INK_WASH_MONOCHROME_HIGH_CONTRAST',
        route: episode.route || 'MANGA_CHAPTER',
        episodeId: episode.id || 'ep_01',
        episodeTitle: episode.title || 'Chapter 1',
        pageCount: pages.length,
        panelCount: totalPanels,
        characterCount: characters.length,
        environmentCount: environments.length,
        lastModified: new Date().toISOString(),
        previewThumbnail
      };

      const existingProjectsStr = localStorage.getItem(VAULT_KEYS.ALL_PROJECTS);
      const projectsList: UniversalProjectSummary[] = existingProjectsStr ? JSON.parse(existingProjectsStr) : [];
      const filtered = projectsList.filter(p => p.id !== series.id);
      filtered.unshift(summary);
      localStorage.setItem(VAULT_KEYS.ALL_PROJECTS, JSON.stringify(filtered));

      // Also index all rendered panels into Universal Panels Vault
      for (const pg of pages) {
        for (const pnl of pg.panels) {
          if (pnl.imageUrl) {
            this.savePanel(pnl, pg.pageNumber, 1, series.id, series.title);
          }
        }
      }
    } catch (e) {
      console.warn("LocalStorage project save warning:", e);
    }

    // 2. Dispatch to PostgreSQL Database Vault
    let dbSuccess = false;
    try {
      const res = await fetch('/api/manga/save-project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const data = await res.json();
        dbSuccess = data.success;
      }
    } catch (err) {
      console.warn("Backend manga project save notice:", err);
    }

    return {
      success: true,
      timestamp: new Date().toISOString()
    };
  },

  /**
   * Load project state from local vault or remote database
   */
  async loadProject(seriesId: string): Promise<{
    series?: Series;
    episode?: Episode;
    pages?: MangaPageRecord[];
    characters?: Character[];
    environments?: Environment[];
    scenes?: Scene[];
  } | null> {
    // Try remote database first
    try {
      const res = await fetch(`/api/manga/load-project/${seriesId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.project) {
          return data.project;
        }
      }
    } catch (err) {
      console.warn("Could not load from remote DB vault, trying local cache:", err);
    }

    // Fallback to local storage vault
    try {
      const localStr = localStorage.getItem(`${VAULT_KEYS.PROJECT_PREFIX}${seriesId}`);
      if (localStr) {
        return JSON.parse(localStr);
      }
    } catch (e) {
      console.warn("Local storage project parse warning:", e);
    }

    return null;
  },

  /**
   * Get all projects summaries
   */
  async getAllProjects(): Promise<UniversalProjectSummary[]> {
    let localProjects: UniversalProjectSummary[] = [];
    try {
      const str = localStorage.getItem(VAULT_KEYS.ALL_PROJECTS);
      if (str) localProjects = JSON.parse(str);
    } catch (e) {}

    try {
      const res = await fetch('/api/vault/projects');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.projects)) {
          const map = new Map<string, UniversalProjectSummary>();
          [...data.projects, ...localProjects].forEach(p => {
            if (p.id && !map.has(p.id)) map.set(p.id, p);
          });
          const merged = Array.from(map.values());
          localStorage.setItem(VAULT_KEYS.ALL_PROJECTS, JSON.stringify(merged));
          return merged;
        }
      }
    } catch (err) {}

    return localProjects;
  }
};
