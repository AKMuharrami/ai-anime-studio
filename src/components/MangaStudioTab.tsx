import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Layers, 
  Cpu, 
  Clock, 
  Sliders, 
  Code2, 
  Play, 
  CheckCircle2, 
  RefreshCw, 
  ArrowRight, 
  ArrowLeft,
  Eye, 
  Maximize2, 
  Zap, 
  Copy, 
  Check,
  ShieldCheck,
  ShieldAlert,
  Wand2,
  AlertCircle,
  BookOpen,
  Image as ImageIcon,
  MessageSquare,
  Layout,
  UserCheck,
  ChevronRight,
  Printer,
  Download,
  Share2,
  Trash2,
  Plus,
  Users,
  Cloud,
  Upload
} from 'lucide-react';
import html2canvas from 'html2canvas';
import JSZip from 'jszip';
import { Scene, Character, Environment, Episode, Series } from '../types';

interface MangaStudioTabProps {
  deductTokens: (cost: number, reason: string) => Promise<boolean>;
  activeSeries: Series | null;
  activeEpisode: Episode | null;
  characters: Character[];
  environments: Environment[];
  onAddCharacter: (character: Character) => void;
  onAddEnvironment: (environment: Environment) => void;
  onBackToHome?: () => void;
}

export interface MangaPanel {
  id: string;
  panelIndex: number;
  layoutClass: string;
  charactersPresent: string[];
  expression: string;
  equipment: string;
  actionPrompt: string;
  speechText: string;
  bubbleStyle: 'oval' | 'burst' | 'thought' | 'whisper';
  bubbleX: number; // Percentage from left
  bubbleY: number; // Percentage from top
  bubbleScale: number;
  bgUrl: string;
  charSheetUrl: string;
  imageUrl: string;
  isRendered: boolean;
  renderingStatus: 'IDLE' | 'COMPLETED' | 'GENERATING';
}


export interface MangaPageRecord {
  id: string;
  pageNumber: number;
  chapterNumber: number;
  panels: MangaPanel[];
  pageImageObj?: string;
}

// Draft Example Chapter Pages definition (3 Pages matching standard chapter draft)
export const DRAFT_EXAMPLE_CHAPTER_PAGES: MangaPageRecord[] = [
  {
    id: 'draft_c1_p1',
    chapterNumber: 1,
    pageNumber: 1,
    panels: [
      {
        id: 'c1_p1_panel_1',
        panelIndex: 1,
        layoutClass: 'col-span-12 row-span-2 h-72 md:h-80',
        charactersPresent: ['Ronin'],
        expression: 'Reflective, looking down over ancient Japanese village',
        equipment: 'Wooden Staff',
        actionPrompt: 'Elderly ronin traveler with staff standing on a hilltop, looking over an ancient Japanese village and wooden temple. Wide panoramic angle, cross-hatched monochrome screentones.',
        speechText: "The world has changed... but the fire in men's hearts remains the same.",
        bubbleStyle: 'thought',
        bubbleX: 68,
        bubbleY: 20,
        bubbleScale: 1.05,
        bgUrl: 'https://cdn2.apiframe.ai/images/4ffcb9da-4863-45cf-9653-7d6cc0c75d0b-1.png',
        charSheetUrl: 'https://cdn2.apiframe.ai/images/4ffcb9da-4863-45cf-9653-7d6cc0c75d0b-1.png',
        imageUrl: 'https://cdn2.apiframe.ai/images/4ffcb9da-4863-45cf-9653-7d6cc0c75d0b-1.png',
        isRendered: true,
        renderingStatus: 'COMPLETED'
      },
      {
        id: 'c1_p1_panel_2',
        panelIndex: 2,
        layoutClass: 'col-span-6 row-span-1 h-56 md:h-64',
        charactersPresent: ['Ronin'],
        expression: 'Elder Ronin carefully watching ready to interfere',
        equipment: 'Wooden Staff',
        actionPrompt: 'Elder Ronin carefully watching from the high temple steps, hand resting on his wooden staff, eyes fixed on the fight, ready to step in and interfere.',
        speechText: "I cannot just standby watching",
        bubbleStyle: 'thought',
        bubbleX: 50,
        bubbleY: 60,
        bubbleScale: 1.0,
        bgUrl: 'https://cdn2.apiframe.ai/images/57e532cb-8485-4af9-bea8-09ee5cade86e-1.png',
        charSheetUrl: 'https://cdn2.apiframe.ai/images/57e532cb-8485-4af9-bea8-09ee5cade86e-1.png',
        imageUrl: 'https://cdn2.apiframe.ai/images/57e532cb-8485-4af9-bea8-09ee5cade86e-1.png',
        isRendered: true,
        renderingStatus: 'COMPLETED'
      },
      {
        id: 'c1_p1_panel_3',
        panelIndex: 3,
        layoutClass: 'col-span-6 row-span-1 h-56 md:h-64',
        charactersPresent: ['Boy'],
        expression: 'Extreme grit, sweat dripping down brow, fierce eyes',
        equipment: 'Wooden Sword Hilt',
        actionPrompt: 'Extreme close-up of the young boy sweating face with intense grit, gripping his wooden sword hilt in front of his face.',
        speechText: "I won't let you harm anyone!",
        bubbleStyle: 'oval',
        bubbleX: 50,
        bubbleY: 45,
        bubbleScale: 1.0,
        bgUrl: 'https://cdn2.apiframe.ai/images/ea81c05f-70f8-48af-9377-a684474024e5-1.png',
        charSheetUrl: 'https://cdn2.apiframe.ai/images/ea81c05f-70f8-48af-9377-a684474024e5-1.png',
        imageUrl: 'https://cdn2.apiframe.ai/images/ea81c05f-70f8-48af-9377-a684474024e5-1.png',
        isRendered: true,
        renderingStatus: 'COMPLETED'
      }
    ]
  },
  {
    id: 'draft_c1_p2',
    chapterNumber: 1,
    pageNumber: 2,
    panels: [
      {
        id: 'c1_p2_panel_1',
        panelIndex: 1,
        layoutClass: 'col-span-12 row-span-2 h-72 md:h-80',
        charactersPresent: ['Boy', 'Bandit 1'],
        expression: 'Shouting strike action, bandit recoiling in pain and surprise',
        equipment: 'Wooden Sword',
        actionPrompt: 'Dynamic action strike: The young boy leaps across the wooden temple porch, striking Bandit 1 across the torso with his wooden sword as action speed lines radiate.',
        speechText: "Bandit 1: Argh! You little brat!",
        bubbleStyle: 'burst',
        bubbleX: 52,
        bubbleY: 30,
        bubbleScale: 1.0,
        bgUrl: 'https://cdn2.apiframe.ai/images/b0fa48e5-fd1a-4b5a-b20d-86a11010a15d-1.png',
        charSheetUrl: 'https://cdn2.apiframe.ai/images/b0fa48e5-fd1a-4b5a-b20d-86a11010a15d-1.png',
        imageUrl: 'https://cdn2.apiframe.ai/images/b0fa48e5-fd1a-4b5a-b20d-86a11010a15d-1.png',
        isRendered: true,
        renderingStatus: 'COMPLETED'
      },
      {
        id: 'c1_p2_panel_2',
        panelIndex: 2,
        layoutClass: 'col-span-6 row-span-1 h-56 md:h-64',
        charactersPresent: ['Ronin'],
        expression: 'Elder Ronin worrying',
        equipment: 'Wooden Staff',
        actionPrompt: 'Elderly ronin traveler holding his wooden staff, watching anxiously with a worried expression as the young boy fights.',
        speechText: "",
        bubbleStyle: 'thought',
        bubbleX: 75,
        bubbleY: 25,
        bubbleScale: 0.8,
        bgUrl: 'https://cdn2.apiframe.ai/images/f2f88c5a-1eb5-420c-ac87-6ae929af2d49-1.png',
        charSheetUrl: 'https://cdn2.apiframe.ai/images/f2f88c5a-1eb5-420c-ac87-6ae929af2d49-1.png',
        imageUrl: 'https://cdn2.apiframe.ai/images/f2f88c5a-1eb5-420c-ac87-6ae929af2d49-1.png',
        isRendered: true,
        renderingStatus: 'COMPLETED'
      },
      {
        id: 'c1_p2_panel_3',
        panelIndex: 3,
        layoutClass: 'col-span-6 row-span-1 h-56 md:h-64',
        charactersPresent: ['Bandit 2', 'Boy'],
        expression: 'Screaming rage on Bandit 2, solid defensive guard on boy',
        equipment: 'Katana, Wooden Sword',
        actionPrompt: 'Bandit 2 charges forward with a two-handed katana strike towards the young boy who braces himself with his wooden sword.',
        speechText: "Bandit 2: Die!",
        bubbleStyle: 'burst',
        bubbleX: 30,
        bubbleY: 50,
        bubbleScale: 0.9,
        bgUrl: 'https://cdn2.apiframe.ai/images/0cc89ace-73e5-4e19-b157-e411608f3339-1.png',
        charSheetUrl: 'https://cdn2.apiframe.ai/images/0cc89ace-73e5-4e19-b157-e411608f3339-1.png',
        imageUrl: 'https://cdn2.apiframe.ai/images/0cc89ace-73e5-4e19-b157-e411608f3339-1.png',
        isRendered: true,
        renderingStatus: 'COMPLETED'
      }
    ]
  },
  {
    id: 'draft_c1_p3',
    chapterNumber: 1,
    pageNumber: 3,
    panels: [
      {
        id: 'c1_p3_panel_1',
        panelIndex: 1,
        layoutClass: 'col-span-12 row-span-2 h-72 md:h-80',
        charactersPresent: ['Ronin'],
        expression: 'Tense focus, hand on staff, carefully watching ready to interfere',
        equipment: 'Wooden Staff',
        actionPrompt: 'Elder Ronin carefully watching from the high temple steps, hand resting on his wooden staff, eyes fixed on the fight, ready to step in and interfere.',
        speechText: "(Hold on just a little longer, boy... I am ready to step in.)",
        bubbleStyle: 'thought',
        bubbleX: 50,
        bubbleY: 25,
        bubbleScale: 1.0,
        bgUrl: 'https://cdn2.apiframe.ai/images/03ecfc4b-5b9f-47b1-ae23-214119affff6-1.png',
        charSheetUrl: 'https://cdn2.apiframe.ai/images/03ecfc4b-5b9f-47b1-ae23-214119affff6-1.png',
        imageUrl: 'https://cdn2.apiframe.ai/images/03ecfc4b-5b9f-47b1-ae23-214119affff6-1.png',
        isRendered: true,
        renderingStatus: 'COMPLETED'
      },
      {
        id: 'c1_p3_panel_2',
        panelIndex: 2,
        layoutClass: 'col-span-6 row-span-1 h-56 md:h-64',
        charactersPresent: ['Boy'],
        expression: 'Bruised face with defiant smile holding broken sword',
        equipment: 'Broken Wooden Sword',
        actionPrompt: 'Close-up shot of the young boy smiling through dirt and bruises on his cheeks, holding up his splintered broken wooden sword.',
        speechText: "Even if I break, I will not fall.",
        bubbleStyle: 'burst',
        bubbleX: 45,
        bubbleY: 42,
        bubbleScale: 1.0,
        bgUrl: 'https://cdn2.apiframe.ai/images/31c0bbe2-bf0e-4923-8a62-c449df401041-1.png',
        charSheetUrl: 'https://cdn2.apiframe.ai/images/31c0bbe2-bf0e-4923-8a62-c449df401041-1.png',
        imageUrl: 'https://cdn2.apiframe.ai/images/31c0bbe2-bf0e-4923-8a62-c449df401041-1.png',
        isRendered: true,
        renderingStatus: 'COMPLETED'
      },
      {
        id: 'c1_p3_panel_3',
        panelIndex: 3,
        layoutClass: 'col-span-6 row-span-1 h-56 md:h-64',
        charactersPresent: ['Ronin'],
        expression: 'Emotional tear streaming down cheek in profile',
        equipment: 'Staff',
        actionPrompt: 'Dramatic side profile close-up of the elderly ronin traveler with tears streaming down his cheek, background temple courtyard in soft focus.',
        speechText: "He reminds me of... myself.",
        bubbleStyle: 'thought',
        bubbleX: 68,
        bubbleY: 32,
        bubbleScale: 1.0,
        bgUrl: 'https://cdn2.apiframe.ai/images/7e083c3f-4ae5-4c5f-b8e0-b30c11624c1e-1.png',
        charSheetUrl: 'https://cdn2.apiframe.ai/images/7e083c3f-4ae5-4c5f-b8e0-b30c11624c1e-1.png',
        imageUrl: 'https://cdn2.apiframe.ai/images/7e083c3f-4ae5-4c5f-b8e0-b30c11624c1e-1.png',
        isRendered: true,
        renderingStatus: 'COMPLETED'
      }
    ]
  }
];

export const MangaStudioTab: React.FC<MangaStudioTabProps> = ({
  activeSeries,
  activeEpisode,
  characters,
  environments,
  onAddCharacter,
  onAddEnvironment,
  onBackToHome,
  deductTokens,
  mangaPages,
  onUpdateMangaPages
}) => {
  // Step navigation: 1: Plot, 2: Character, 3: Qwen Composition, 4: Speech Overlay
  const [activeWorkflowStep, setActiveWorkflowStep] = useState<number>(1);
  const [selectedPanelId, setSelectedPanelId] = useState<string>('panel_1');
  const [copiedPayload, setCopiedPayload] = useState(false);
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);
  const [isRenderingPanel, setIsRenderingPanel] = useState(false);
  const [isAssemblingPage, setIsAssemblingPage] = useState(false);
    const getInitialScope = () => {
    if (activeEpisode?.route === 'MANGA_SINGLE_PAGE') return 'single_page';
    if (activeEpisode?.route === 'MANGA_VOLUME') return 'full_story';
    return 'single_chapter';
  };
  const [mangaScope, setMangaScope] = useState<'single_page' | 'single_chapter' | 'full_story'>(getInitialScope());
  const [mangaArchetype, setMangaArchetype] = useState('Classic Seinen');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [currentChapter, setCurrentChapter] = useState<number>(1);

  const [historyPages, setHistoryPages] = useState<MangaPageRecord[]>(DRAFT_EXAMPLE_CHAPTER_PAGES);
  const [isCapturing, setIsCapturing] = useState(false);
  const [showChapterPreview, setShowChapterPreview] = useState(false);
  const [fallbackTemplate, setFallbackTemplate] = useState<string>('GRID_ADAPTIVE');
  const [isExportingZip, setIsExportingZip] = useState(false);
  const [assembledPageModal, setAssembledPageModal] = useState<{
    pageImageObj: string;
    pageNumber: number;
    chapterNumber: number;
    title: string;
  } | null>(null);
  const [toastNotification, setToastNotification] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastNotification(msg);
    setTimeout(() => setToastNotification(null), 3500);
  };

  const [mangaPageFooterText, setMangaPageFooterText] = useState(
    `- MANGA DRAFT • PAGE 01 -`
  );
  const [isEditingFooter, setIsEditingFooter] = useState(false);

  // Vaults & Galleries Modals
  const [isCharacterVaultOpen, setIsCharacterVaultOpen] = useState(false);
  const [isEnvironmentVaultOpen, setIsEnvironmentVaultOpen] = useState(false);
  const [isPanelVaultOpen, setIsPanelVaultOpen] = useState(false);
  const [isChaptersGalleryOpen, setIsChaptersGalleryOpen] = useState(false);

  // Vercel Cloud Storage Hub & Neon DB Sync Hub States
  const [isStorageHubOpen, setIsStorageHubOpen] = useState(false);
  const [storageFiles, setStorageFiles] = useState<any[]>([]);
  const [isFetchingStorage, setIsFetchingStorage] = useState(false);
  const [isUploadingToBlob, setIsUploadingToBlob] = useState(false);
  const [blobUploadCategory, setBlobUploadCategory] = useState<'characters' | 'environments' | 'panels' | 'manga-pages'>('manga-pages');

  const fetchStorageFiles = async () => {
    setIsFetchingStorage(true);
    try {
      const res = await fetch('/api/storage/files?userId=usr_8829_alpha_neon');
      const data = await res.json();
      if (data.success) {
        setStorageFiles(data.files || []);
      }
    } catch (err) {
      console.error("Error fetching storage files:", err);
    } finally {
      setIsFetchingStorage(false);
    }
  };

  const handleUploadCustomFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingToBlob(true);
    showToast("Uploading custom asset to secure tenant folder...");

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Data = reader.result as string;
        try {
          const res = await fetch('/api/storage/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              filename: file.name,
              fileData: base64Data,
              category: blobUploadCategory,
              userId: 'usr_8829_alpha_neon'
            })
          });
          const data = await res.json();
          if (data.success) {
            showToast(`✨ File successfully stored on ${data.driver === 'vercel_blob' ? 'Vercel Blob Cloud' : 'Local SSD Storage'}!`);
            
            // Add file straight to appropriate client vault array!
            if (blobUploadCategory === 'characters') {
              onAddCharacter({
                id: `char_custom_${Date.now()}`,
                series_id: activeSeries?.id || 'ser_cyber_aethel',
                name: file.name.split('.')[0] || 'Custom character',
                fish_voice_token: 'FISH_VOICE_JP_MALE_TACTICAL_BARITONE_01',
                visual_descriptor: 'Custom user-uploaded character sheet',
                image_url: data.url,
                description: 'Custom user-uploaded character sheet stored securely.',
                is_enhanced: true
              } as any);
            } else if (blobUploadCategory === 'environments') {
              onAddEnvironment({
                id: `env_custom_${Date.now()}`,
                series_id: activeSeries?.id || 'ser_cyber_aethel',
                name: file.name.split('.')[0] || 'Custom location',
                visual_descriptor: 'Custom user-uploaded environment stage',
                image_url: data.url,
                description: 'Custom user-uploaded background stage stored securely.'
              } as any);
            }

            // Refresh files list
            fetchStorageFiles();
          } else {
            alert("Upload failed: " + data.error);
          }
        } catch (err: any) {
          alert("Network upload error: " + err.message);
        } finally {
          setIsUploadingToBlob(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
      setIsUploadingToBlob(false);
    }
  };

  const handleDeleteStorageFile = async (url: string) => {
    if (!confirm("Are you sure you want to permanently delete this file from Cloud Storage & DB records?")) return;
    
    showToast("Purging file from cloud container...");
    try {
      const res = await fetch('/api/storage/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });
      const data = await res.json();
      if (data.success) {
        showToast("✨ File purged successfully!");
        fetchStorageFiles();
      } else {
        alert("Failed to delete: " + data.message);
      }
    } catch (err: any) {
      alert("Delete network error: " + err.message);
    }
  };


  // New Generation States inside Manga Studio
  const [step2Tab, setStep2Tab] = useState<'characters' | 'environments'>('characters');
  const [isGeneratingMangaChar, setIsGeneratingMangaChar] = useState(false);
  const [mangaCharName, setMangaCharName] = useState('');
  const [mangaCharDescriptor, setMangaCharDescriptor] = useState('Honorable samurai protagonist with dark messy hair, intense black eyes, wearing modest traditional robes covering full body.');
  const [mangaCharVoice, setMangaCharVoice] = useState('FISH_VOICE_JP_MALE_TACTICAL_BARITONE_01');

  // Guided Character Builder states
  const [characterBuilderMode, setCharacterBuilderMode] = useState<'guided' | 'custom'>('guided');
  const [charDemographic, setCharDemographic] = useState('Adult Male');
  const [charDemographicCustom, setCharDemographicCustom] = useState('');
  const [charHair, setCharHair] = useState('Traditional samurai topknot (chonmage) with loose wind-blown side bangs');
  const [charHairCustom, setCharHairCustom] = useState('');
  const [charEyes, setCharEyes] = useState('Narrowed, piercing dark eyes with intense battle-hardened stoic focus');
  const [charEyesCustom, setCharEyesCustom] = useState('');
  const [charFace, setCharFace] = useState('Rugged chiseled jawline, stoic expression, and a subtle horizontal scar across the left brow');
  const [charFaceCustom, setCharFaceCustom] = useState('');
  const [charAttire, setCharAttire] = useState('smart-auto');
  const [charAttireCustom, setCharAttireCustom] = useState('');

  const [isGeneratingMangaEnv, setIsGeneratingMangaEnv] = useState(false);
  const [mangaEnvLocation, setMangaEnvLocation] = useState('');
  const [mangaEnvStyle, setMangaEnvStyle] = useState('Cyberpunk server core mainframe with dark cable clusters and wireframes.');
  
  // Smart Scanner & Autofill states
  const [isScanningScript, setIsScanningScript] = useState(false);
  const [hasScanned, setHasScanned] = useState(true);
  const [autofillSuccessMessage, setAutofillSuccessMessage] = useState<string | null>(null);

  // Character Reference Quality Scanner & Auto-Enhancer States
  const [isAutoEnhanceEnabled, setIsAutoEnhanceEnabled] = useState(true);
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
          art_style_seed: 'GEKIGA_INK_WASH_MONOCHROME_HIGH_CONTRAST',
          is_manga: true
        })
      });
      const data = await res.json();
      if (data.success && data.character) {
        onAddCharacter(data.character);
        // Automatically link enhanced turnaround sheet to panels containing this character
        handleUpdatePanel(activePanel.id, {
          charSheetUrl: data.character.turnaround_url || activePanel.charSheetUrl
        });
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
          art_style_seed: 'GEKIGA_INK_WASH_MONOCHROME_HIGH_CONTRAST',
          is_manga: true
        })
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.characters)) {
        data.characters.forEach((c: Character) => {
          if (c.is_enhanced) onAddCharacter(c);
        });
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

  // Smart genre/world detector for prompt and autofill consistency
  const detectProjectGenre = (): 'ANCIENT' | 'FANTASY' | 'CYBERPUNK' | 'MODERN' => {
    const combined = `${activeSeries?.global_lore || ''} ${activeSeries?.title || ''} ${activeSeries?.description || ''} ${mangaPlotConcept || ''} ${activeSeries?.art_style_seed || ''}`.toLowerCase();
    
    if (
      combined.includes('ancient') ||
      combined.includes('feudal') ||
      combined.includes('samurai') ||
      combined.includes('ronin') ||
      combined.includes('dynasty') ||
      combined.includes('hanfu') ||
      combined.includes('kimono') ||
      combined.includes('haori') ||
      combined.includes('wuxia') ||
      combined.includes('xianxia') ||
      combined.includes('temple') ||
      combined.includes('shrine') ||
      combined.includes('palace') ||
      combined.includes('scroll') ||
      combined.includes('emperor') ||
      combined.includes('shogun') ||
      combined.includes('clan') ||
      combined.includes('monk') ||
      combined.includes('historical') ||
      combined.includes('katana') ||
      combined.includes('swordsman') ||
      combined.includes('warrior') ||
      combined.includes('blade') ||
      combined.includes('battlefield') ||
      combined.includes('roman') ||
      combined.includes('greek') ||
      combined.includes('mesopotamia') ||
      combined.includes('antiquity') ||
      combined.includes('bronze age')
    ) {
      return 'ANCIENT';
    }
    
    if (
      combined.includes('frost citadel') ||
      combined.includes('citadel') ||
      combined.includes('magic') ||
      combined.includes('rune') ||
      combined.includes('mana') ||
      combined.includes('elf') ||
      combined.includes('dragon') ||
      combined.includes('knight') ||
      combined.includes('paladin') ||
      combined.includes('sorcerer') ||
      combined.includes('crystal') ||
      combined.includes('mythical') ||
      combined.includes('dungeon') ||
      combined.includes('ethereal') ||
      combined.includes('glacial') ||
      combined.includes('dark fantasy') ||
      combined.includes('berserk') ||
      combined.includes('fantasy')
    ) {
      return 'FANTASY';
    }

    if (
      combined.includes('2099') ||
      combined.includes('cyber') ||
      combined.includes('neon') ||
      combined.includes('neural') ||
      combined.includes('neo-kyoto') ||
      combined.includes('android') ||
      combined.includes('hacker') ||
      combined.includes('tech') ||
      combined.includes('hologram') ||
      combined.includes('matrix') ||
      combined.includes('cybernetic') ||
      combined.includes('quantum') ||
      combined.includes('synth') ||
      combined.includes('cyborg') ||
      combined.includes('sci-fi')
    ) {
      return 'CYBERPUNK';
    }

    return 'MODERN';
  };

  // Smart parser to find missing environmental locations from the script matching the world lore
  const extractEnvironmentsFromScript = () => {
    const detected: string[] = [];
    const genre = detectProjectGenre();

    panels.forEach(p => {
      const promptLower = p.actionPrompt.toLowerCase();
      
      // Ancient / Feudal locations
      if (promptLower.includes('shrine') || promptLower.includes('temple') || promptLower.includes('altar')) {
        if (!detected.includes('Ancient Mountain Shrine')) detected.push('Ancient Mountain Shrine');
      }
      if (promptLower.includes('palace') || promptLower.includes('throne') || promptLower.includes('hall') || promptLower.includes('court')) {
        if (!detected.includes('Imperial Palace Throne Hall')) detected.push('Imperial Palace Throne Hall');
      }
      if (promptLower.includes('bamboo') || promptLower.includes('forest') || promptLower.includes('woods') || promptLower.includes('grove')) {
        if (!detected.includes('Misty Bamboo Forest Clearing')) detected.push('Misty Bamboo Forest Clearing');
      }
      if (promptLower.includes('gate') || promptLower.includes('fortress') || promptLower.includes('wall') || promptLower.includes('tower')) {
        if (!detected.includes('Stone Fortress Gatehouse')) detected.push('Stone Fortress Gatehouse');
      }
      if (promptLower.includes('dojo') || promptLower.includes('training') || promptLower.includes('tatami')) {
        if (!detected.includes('Traditional Martial Dojo')) detected.push('Traditional Martial Dojo');
      }

      // Cyber / Sci-fi locations
      if (promptLower.includes('server room') || promptLower.includes('server core') || promptLower.includes('mainframe')) {
        if (!detected.includes('Server Core Mainframe')) detected.push('Server Core Mainframe');
      }
      if (promptLower.includes('tech hub') || promptLower.includes('terminal') || promptLower.includes('hacking')) {
        if (!detected.includes('Holographic Tech Hub')) detected.push('Holographic Tech Hub');
      }
      if (promptLower.includes('citadel') || promptLower.includes('roof') || promptLower.includes('skyline')) {
        if (!detected.includes('Citadel Rooftop Vista')) detected.push('Citadel Rooftop Vista');
      }
    });

    if (detected.length === 0) {
      if (genre === 'ANCIENT') {
        detected.push('Ancient Palace Courtyard', 'Misty Bamboo Shrine', 'Feudal Fortress Gatehouse');
      } else if (genre === 'FANTASY') {
        detected.push('Crystalline Throne Room', 'Glacial Citadel Ramparts', 'Ancient Runestone Sanctuary');
      } else if (genre === 'CYBERPUNK') {
        detected.push('Server Core Mainframe', 'Holographic Tech Hub', 'Citadel Neon Rooftop');
      } else {
        detected.push('Urban Rooftop Dusk', 'Training Dojo Interior', 'Rain-Slicked Alleyway');
      }
    }
    return detected;
  };

  // High-fidelity smart turnaround character prompt generator with all consistency parameters
  const getCharacterAutofillDescriptor = (name: string): string => {
    let genre = detectProjectGenre();
    const cleanName = name.trim() || 'Character';
    const lowerName = cleanName.toLowerCase();

    if (
      lowerName.includes('warrior') || lowerName.includes('samurai') || lowerName.includes('ronin') ||
      lowerName.includes('swordsman') || lowerName.includes('general') || lowerName.includes('shogun') ||
      lowerName.includes('blade') || lowerName.includes('clan')
    ) {
      genre = 'ANCIENT';
    }

    if (genre === 'ANCIENT') {
      return `${cleanName}: Canon Japanese Seinen Gekiga Manga Model Sheet (Ancient / Feudal World Setting).
• Age & Anatomy: Mature 32-year-old battle-tested warrior with hardened muscular physique.
• Hairstyle & Color: Coarse obsidian raven-black hair gathered in a traditional samurai topknot (chonmage) with loose wind-blown side bangs.
• Eye Morphology: Narrowed, piercing dark amber-obsidian eyes with intense battle-hardened focus and defined brow creases.
• Facial Architecture & Skin: Rugged chiseled jawline, prominent cheekbones, stoic weathered warrior expression, sun-bronzed skin tone, subtle scar across brow.
• Signature Wardrobe: Authentic battle-worn dark indigo and charcoal samurai haori over black iron lamellar armor plates, leather forearm vambraces (kote), tailored dark hakama trousers, wide textured obi sash, strapped straw waraji sandals. ZERO modern clothing.
• Weapons & Props: Twin katana in worn lacquered scabbards tucked in obi sash with braided sageo cord.
• CRITICAL 4-ANGLE CONSISTENCY: Multi-angle orthographic turnaround (Front View 0°, 3/4 View 45°, Side Profile 90°, Back View 180°). Facial architecture, hair silhouette, and samurai armor details maintain 100% strict unchanging visual continuity across all panels.`;
    }

    if (genre === 'FANTASY') {
      return `${cleanName}: Canon Japanese Seinen Gekiga Manga Model Sheet (Dark Fantasy Setting).
• Age & Anatomy: Mature 30-year-old knight commander with imposing armored build.
• Hairstyle & Color: Flowing medium silver-frosted hair with sculpted sharp locks and crystalline sheen.
• Eye Morphology: Luminous crystal-azure eyes with commanding knightly focus.
• Facial Architecture & Skin: Regal chiseled facial structure, sharp defined jawline, resolute knightly expression.
• Signature Wardrobe: Etched runic silver-mythril full-plate armor with azure velvet mantle, high-collared neck guard, sapphire-inlaid breastplate, reinforced chainmail.
• Weapons & Props: Frost-forged broadsword with glowing runic fuller, celestial crest brooch.
• CRITICAL 4-ANGLE CONSISTENCY: Multi-angle orthographic turnaround (Front View 0°, 3/4 View 45°, Side Profile 90°, Back View 180°). Exact hairstyle, eye shape, and armor continuity across all panels.`;
    }

    if (genre === 'CYBERPUNK') {
      return `${cleanName}: Canon Japanese Seinen Gekiga Manga Model Sheet (Cyberpunk 2099 Setting).
• Age & Anatomy: Mature 29-year-old tactical cybernetic operative with athletic build.
• Hairstyle & Color: Tousled layered obsidian black hair with sharp angular bangs and cyan specular sheen.
• Eye Morphology: Right eye natural dark brown, left eye glowing cobalt cybernetic ocular lens with active HUD reticle.
• Facial Architecture & Skin: Sharp angular jawline, slight cybernetic neural port along right temple, calm tactical expression.
• Signature Wardrobe: Matte black high-neck tactical trenchcoat with luminescent cyan fiber-optic seam piping, armored combat vest, dark cargo utility trousers.
• Weapons & Props: Tactical pulse sidearm in holster, neural wrist deck with fiber-optic cable connectors.
• CRITICAL 4-ANGLE CONSISTENCY: Multi-angle orthographic turnaround (Front View 0°, 3/4 View 45°, Side Profile 90°, Back View 180°). Exact hairstyle, ocular implant, and coat continuity across all panels.`;
    }

    return `${cleanName}: Canon Japanese Seinen Gekiga Manga Model Sheet (Modern Setting).
• Age & Anatomy: Mature 31-year-old gritty detective and martial artist.
• Hairstyle & Color: Clean textured crop with dark raven strands and natural parted bangs.
• Eye Morphology: Deep-set piercing hazel-brown eyes with sharp observant gaze.
• Facial Architecture & Skin: Defined rugged jawline, subtle dark stubble shadow, calm disciplined expression.
• Signature Wardrobe: Heavy dark charcoal overcoat over a black tactical turtleneck, tailored dark combat trousers, sturdy leather boots.
• Weapons & Props: Concealed tactical holster, titanium field watch, discreet encrypted earpiece.
• CRITICAL 4-ANGLE CONSISTENCY: Multi-angle orthographic turnaround (Front View 0°, 3/4 View 45°, Side Profile 90°, Back View 180°). Exact hairstyle and facial continuity across all panels.`;
  };

  // High-fidelity environment backdrop prompt library matching world setting
  const getEnvironmentAutofillStyle = (location: string): string => {
    const genre = detectProjectGenre();
    
    if (genre === 'ANCIENT') {
      return `4K Master Monochrome Manga Background Stage Layout: "${location}". Ancient world architectural layout, wide landscape composition, empty stage plate, pristine floor plane and spatial depth, 100% uninhabited location without people. Traditional carved timber pillars, stone flagstones, paper shoji screens, stone lanterns, atmospheric mist, high-contrast black and white ink lineart with clean halftone screentone shading.`;
    }

    if (genre === 'FANTASY') {
      return `4K Master Monochrome Manga Background Stage Layout: "${location}". High fantasy architectural layout, wide crystalline landscape composition, empty stage plate, vaulted stone arches, glowing rune sigils on stone walls, deep spatial perspective, 100% uninhabited location without people. Authentic Gekiga manga ink lineart with clean screentones.`;
    }

    if (genre === 'CYBERPUNK') {
      return `4K Master Monochrome Manga Background Stage Layout: "${location}". Cyberpunk architectural layout, deep perspective with stacked server columns, floating holographic displays, wireframe indicators, dangling cables, empty stage plate, 100% uninhabited without people. High-contrast ink cross-hatching and screentones.`;
    }

    return `4K Master Monochrome Manga Background Stage Layout: "${location}". Modern cinematic scenery layout, empty stage plate, deep spatial coordinate lines, crisp architectural perspective, 100% character-free layout. Authentic Japanese manga ink screentone art.`;
  };

  // Script Input State
  const [mangaPlotConcept, setMangaPlotConcept] = useState(() => {
    if (activeEpisode?.full_script_json?.logline) return activeEpisode.full_script_json.logline;
    return "";
  });

  const [manualPageCount, setManualPageCount] = useState<number>(3);
  const [manualPanelsPerPage, setManualPanelsPerPage] = useState<number>(3);

  // Manga Storyboard/Panels state initialized to props or Draft Example Chapter Pages
  const [pages, setPages] = useState<MangaPageRecord[]>(() => {
    if (mangaPages && mangaPages.length > 0) return mangaPages;
    return DRAFT_EXAMPLE_CHAPTER_PAGES;
  });
  const [activePageIndex, setActivePageIndex] = useState(0);

  const [panels, setPanels] = useState<MangaPanel[]>(() => {
    const initialPages = (mangaPages && mangaPages.length > 0) ? mangaPages : DRAFT_EXAMPLE_CHAPTER_PAGES;
    return initialPages[0]?.panels || DRAFT_EXAMPLE_CHAPTER_PAGES[0].panels;
  });

  // Keep pages in sync when active panels change
  useEffect(() => {
    setPages(prevPages => {
      if (!prevPages[activePageIndex]) return prevPages;
      const updated = [...prevPages];
      updated[activePageIndex] = {
        ...updated[activePageIndex],
        panels: panels
      };
      return updated;
    });
  }, [panels, activePageIndex]);

  // Sync back to parent App state & Local Storage whenever pages state changes
  useEffect(() => {
    if (onUpdateMangaPages && pages.length > 0) {
      onUpdateMangaPages(pages);
    }
  }, [pages, onUpdateMangaPages]);

  const handleSwitchPage = (newIndex: number) => {
    if (newIndex < 0 || newIndex >= pages.length) return;
    
    // Save current active panels to the pages state before switching
    const updatedPages = [...pages];
    updatedPages[activePageIndex] = {
      ...updatedPages[activePageIndex],
      panels: panels
    };
    
    // Load the selected page's panels
    setPages(updatedPages);
    setActivePageIndex(newIndex);
    setPanels(updatedPages[newIndex].panels);
    setSelectedPanelId(updatedPages[newIndex].panels[0]?.id || '');
  };

  const MANGA_LAYOUT_TEMPLATES = [
    { id: 'GRID_ADAPTIVE', label: 'Adaptive Flow', desc: 'Flexible science-based layout adapting to active panel count', requiredPanels: null, tag: 'All Counts' },
    { id: 'SINGLE_PANEL_SPLASH', label: 'Full Splash', desc: '1-Panel full-page dramatic impact splash', requiredPanels: 1, tag: '1 Panel' },
    { id: 'CINEMATIC_2_PANEL', label: 'Cinematic Dual', desc: '2-Panel horizontal cinematic split', requiredPanels: 2, tag: '2 Panels' },
    { id: 'VERTICAL_DUO_2_PANEL', label: 'Vertical Duo', desc: '2-Panel side-by-side vertical split', requiredPanels: 2, tag: '2 Panels' },
    { id: 'DRAMATIC_3_PANEL', label: 'Dramatic Tri-Focal', desc: '3-Panel focal layout (Hero top + split bottom)', requiredPanels: 3, tag: '3 Panels' },
    { id: 'TRIPLE_STRIP_3_PANEL', label: 'Triple Stack', desc: '3-Panel equal horizontal story strips', requiredPanels: 3, tag: '3 Panels' },
    { id: 'GOLDEN_RATIO_SPREAD', label: 'Golden Spread', desc: 'Asymmetric golden ratio 4-panel spread', requiredPanels: 4, tag: '4 Panels' },
    { id: 'CINEMATIC_RHYTHM_4_PANEL', label: 'Cinematic Rhythm', desc: 'Rhythmic 4-panel split flow', requiredPanels: 4, tag: '4 Panels' },
    { id: 'YONKOMA_4_PANEL', label: 'Yonkoma 4-Strip', desc: 'Classic 4-panel vertical gag/story strip', requiredPanels: 4, tag: '4 Panels' },
    { id: 'MANGA_MASTER_ASYMMETRIC', label: 'Master Asymmetric', desc: 'Dynamic 5-panel master composition', requiredPanels: 5, tag: '5 Panels' },
    { id: 'MOSAIC_SPLIT_5_PANEL', label: 'Mosaic Split', desc: 'High-density 5-panel mosaic layout', requiredPanels: 5, tag: '5 Panels' },
  ];

  const getActivePageTemplate = (): string => {
    let currentId = fallbackTemplate;
    if (pages.length > 0 && pages[activePageIndex]) {
      currentId = pages[activePageIndex].gridLayoutTemplate || 'GRID_ADAPTIVE';
    }
    const tpl = MANGA_LAYOUT_TEMPLATES.find(t => t.id === currentId);
    if (tpl && tpl.requiredPanels !== null && tpl.requiredPanels !== panels.length) {
      return 'GRID_ADAPTIVE';
    }
    return currentId;
  };

  const getPageRows = (panels: MangaPanel[], templateId: string) => {
    const p = panels;
    const count = p.length;

    if (templateId === 'SINGLE_PANEL_SPLASH' && count >= 1) {
      return [
        { height: '98%', rowPanels: [{ panel: p[0], width: '100%' }] }
      ];
    }
    if (templateId === 'CINEMATIC_2_PANEL' && count >= 2) {
      return [
        { height: '48%', rowPanels: [{ panel: p[0], width: '100%' }] },
        { height: '48%', rowPanels: [{ panel: p[1], width: '100%' }] }
      ];
    }
    if (templateId === 'VERTICAL_DUO_2_PANEL' && count >= 2) {
      return [
        { height: '96%', rowPanels: [{ panel: p[0], width: '50%' }, { panel: p[1], width: '50%' }] }
      ];
    }
    if (templateId === 'DRAMATIC_3_PANEL' && count >= 3) {
      return [
        { height: '42%', rowPanels: [{ panel: p[0], width: '100%' }] },
        { height: '54%', rowPanels: [{ panel: p[1], width: '60%' }, { panel: p[2], width: '40%' }] }
      ];
    }
    if (templateId === 'TRIPLE_STRIP_3_PANEL' && count >= 3) {
      return [
        { height: '31%', rowPanels: [{ panel: p[0], width: '100%' }] },
        { height: '31%', rowPanels: [{ panel: p[1], width: '100%' }] },
        { height: '31%', rowPanels: [{ panel: p[2], width: '100%' }] }
      ];
    }
    if (templateId === 'GOLDEN_RATIO_SPREAD' && count >= 4) {
      return [
        { height: '34%', rowPanels: [{ panel: p[0], width: '100%' }] },
        { height: '42%', rowPanels: [{ panel: p[1], width: '58%' }, { panel: p[2], width: '42%' }] },
        { height: '22%', rowPanels: [{ panel: p[3], width: '100%' }] }
      ];
    }
    if (templateId === 'CINEMATIC_RHYTHM_4_PANEL' && count >= 4) {
      return [
        { height: '26%', rowPanels: [{ panel: p[0], width: '100%' }] },
        { height: '46%', rowPanels: [{ panel: p[1], width: '50%' }, { panel: p[2], width: '50%' }] },
        { height: '26%', rowPanels: [{ panel: p[3], width: '100%' }] }
      ];
    }
    if (templateId === 'YONKOMA_4_PANEL' && count >= 4) {
      return [
        { height: '23%', rowPanels: [{ panel: p[0], width: '100%' }] },
        { height: '23%', rowPanels: [{ panel: p[1], width: '100%' }] },
        { height: '23%', rowPanels: [{ panel: p[2], width: '100%' }] },
        { height: '23%', rowPanels: [{ panel: p[3], width: '100%' }] }
      ];
    }
    if (templateId === 'MANGA_MASTER_ASYMMETRIC' && count >= 5) {
      return [
        { height: '28%', rowPanels: [{ panel: p[0], width: '42%' }, { panel: p[1], width: '58%' }] },
        { height: '36%', rowPanels: [{ panel: p[2], width: '100%' }] },
        { height: '34%', rowPanels: [{ panel: p[3], width: '50%' }, { panel: p[4], width: '50%' }] }
      ];
    }
    if (templateId === 'MOSAIC_SPLIT_5_PANEL' && count >= 5) {
      return [
        { height: '32%', rowPanels: [{ panel: p[0], width: '35%' }, { panel: p[1], width: '65%' }] },
        { height: '32%', rowPanels: [{ panel: p[2], width: '100%' }] },
        { height: '32%', rowPanels: [{ panel: p[3], width: '65%' }, { panel: p[4], width: '35%' }] }
      ];
    }

    // Fallback / Adaptive Flow for any panel count
    if (count <= 1) {
      return [{ height: '98%', rowPanels: [{ panel: p[0] || p[0], width: '100%' }] }];
    } else if (count === 2) {
      return [
        { height: '48%', rowPanels: [{ panel: p[0], width: '100%' }] },
        { height: '48%', rowPanels: [{ panel: p[1], width: '100%' }] }
      ];
    } else if (count === 3) {
      return [
        { height: '38%', rowPanels: [{ panel: p[0], width: '100%' }] },
        { height: '58%', rowPanels: [{ panel: p[1], width: '50%' }, { panel: p[2], width: '50%' }] }
      ];
    } else if (count === 4) {
      return [
        { height: '28%', rowPanels: [{ panel: p[0], width: '100%' }] },
        { height: '40%', rowPanels: [{ panel: p[1], width: '50%' }, { panel: p[2], width: '50%' }] },
        { height: '28%', rowPanels: [{ panel: p[3], width: '100%' }] }
      ];
    } else {
      return [
        { height: '26%', rowPanels: [{ panel: p[0], width: '100%' }] },
        { height: '35%', rowPanels: [{ panel: p[1], width: '50%' }, { panel: p[2], width: '50%' }] },
        { height: '35%', rowPanels: p.slice(3, count).map(panel => ({ panel, width: `${100 / Math.max(1, count - 3)}%` })) }
      ];
    }
  };

  const adjustPanelCount = (targetCount: number, currentPanels: MangaPanel[]) => {
    if (currentPanels.length === targetCount) return currentPanels;

    if (currentPanels.length > targetCount) {
      // Slice
      const truncated = currentPanels.slice(0, targetCount);
      return truncated.map((p, idx) => ({ ...p, panelIndex: idx + 1 }));
    } else {
      // Append
      const updated = [...currentPanels];
      while (updated.length < targetCount) {
        const newIndex = updated.length + 1;
        updated.push({
          id: `panel_gen_${Date.now()}_${newIndex}`,
          panelIndex: newIndex,
          layoutClass: 'col-span-6 row-span-1 h-64',
          charactersPresent: characters[0] ? [characters[0].name] : [],
          expression: 'Intense focus',
          equipment: '',
          actionPrompt: 'New manga scene taking place...',
          speechText: 'Dialogue goes here...',
          bubbleStyle: 'oval',
          bubbleX: 50,
          bubbleY: 45,
          bubbleScale: 1.0,
          bgUrl: environments[0]?.master_keyframe_url || 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=1200',
          charSheetUrl: characters[0]?.turnaround_url || 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=600',
          imageUrl: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=1200',
          isRendered: false,
          renderingStatus: 'IDLE'
        });
      }
      return updated;
    }
  };

  const handleTemplateChange = (templateId: string) => {
    // Apply grid layout template to active page without altering or auto-increasing the smartly distributed panels
    const updatedPages = [...pages];
    if (updatedPages[activePageIndex]) {
      updatedPages[activePageIndex].gridLayoutTemplate = templateId;
      setPages(updatedPages);
    } else {
      setFallbackTemplate(templateId);
    }
  };

  const activePanel = panels.find(p => p.id === selectedPanelId) || panels[0];

  const handleUpdatePanel = (panelId: string, updatedFields: Partial<MangaPanel>) => {
    setPanels(prev => prev.map(p => p.id === panelId ? { ...p, ...updatedFields } : p));
  };

  const handleAddPanelManual = () => {
    const newPanel: MangaPanel = {
      id: `panel_manual_${Date.now()}`,
      panelIndex: panels.length + 1,
      layoutClass: 'col-span-6 row-span-1 h-64',
      charactersPresent: [],
      expression: 'Neutral',
      equipment: '',
      actionPrompt: 'Enter action details here...',
      speechText: 'Dialogue goes here...',
      bubbleStyle: 'oval',
      bubbleX: 50,
      bubbleY: 50,
      bubbleScale: 1.0,
      bgUrl: environments[0]?.master_keyframe_url || 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=1200',
      charSheetUrl: characters[0]?.turnaround_url || 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=600',
      imageUrl: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=1200',
      isRendered: false,
      renderingStatus: 'IDLE'
    };
    setPanels(prev => [...prev, newPanel]);
    setSelectedPanelId(newPanel.id);
  };

  const handleDeletePanel = (panelId: string) => {
    if (panels.length <= 1) return;
    const newPanels = panels.filter(p => p.id !== panelId);
    setPanels(newPanels);
    if (selectedPanelId === panelId) {
      setSelectedPanelId(newPanels[0].id);
    }
  };

  // Step 1: Simulate DeepSeek-R1 Script & Layout Parsing
  const handleGenerateMangaScript = async () => {
    if (!mangaPlotConcept.trim()) return;
    
    setIsGeneratingScript(true);
    try {
      const response = await fetch('/api/manga/blueprint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plot_concept: mangaPlotConcept,
          scope: mangaScope,
          series_title: activeSeries?.title || 'New Manga',
          archetype: mangaArchetype,
          manual_page_count: manualPageCount,
          manual_panels_per_page: manualPanelsPerPage
        })
      });

      if (!response.ok) throw new Error('Failed to generate blueprint');
      
      const data = await response.json();
      if (data.success && data.blueprint?.pages) {
        const generatedPages: MangaPageRecord[] = data.blueprint.pages.map((p: any) => ({
          id: `page_${p.pageNumber}_${Math.random().toString(36).substr(2, 9)}`,
          pageNumber: p.pageNumber,
          chapterNumber: currentChapter,
          gridLayoutTemplate: 'GRID_ADAPTIVE',
          panels: p.panels.map((panel: any) => {
            const firstCharName = panel.charactersPresent?.[0];
            const matchedChar = characters.find(c => firstCharName && c.name.toLowerCase() === firstCharName.toLowerCase());
            const matchedEnv = environments[0];
            return {
              ...panel,
              id: `panel_${panel.panelIndex}_${Math.random().toString(36).substr(2, 9)}`,
              bgUrl: matchedEnv?.master_keyframe_url || 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=1200',
              charSheetUrl: matchedChar ? (matchedChar.turnaround_url || matchedChar.reference_images?.[0] || '') : (characters[0]?.turnaround_url || characters[0]?.reference_images?.[0] || 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=600'),
              imageUrl: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=1200',
              isRendered: false,
              renderingStatus: 'IDLE'
            };
          })
        }));
        
        setPages(generatedPages);
        setActivePageIndex(0);
        setPanels(generatedPages[0].panels);
        setSelectedPanelId(generatedPages[0].panels[0].id);
        setActiveWorkflowStep(2); // Auto proceed to Character step
      }
    } catch (err) {
      console.error('Manga blueprint error:', err);
    } finally {
      setIsGeneratingScript(false);
    }
  };

  // Toggle a character in/out of the currently active panel
  const handleToggleCharacterInPanel = (charName: string) => {
    const cleanName = charName.trim();
    if (!cleanName) return;
    const current = activePanel.charactersPresent || [];
    const exists = current.some(c => c.toLowerCase() === cleanName.toLowerCase());
    let updated: string[];
    if (exists) {
      updated = current.filter(c => c.toLowerCase() !== cleanName.toLowerCase());
    } else {
      if (current.length >= 3) {
        alert("Pipeline Constraint: Maximum 3 focal characters per panel enforced for model consistency and age fidelity. Additional background characters can be described in the panel action prompt.");
        return;
      }
      updated = [...current, cleanName];
    }
    
    // Find the first character with a turnaround sheet to anchor charSheetUrl
    const matchedFirst = characters.find(c => updated.length > 0 && c.name.toLowerCase() === updated[0].toLowerCase());
    handleUpdatePanel(activePanel.id, {
      charactersPresent: updated,
      charSheetUrl: matchedFirst ? (matchedFirst.turnaround_url || matchedFirst.reference_images?.[0] || activePanel.charSheetUrl) : activePanel.charSheetUrl
    });
  };

  // Auto-detect which characters are mentioned in the active panel's action prompt
  const handleAutoDetectCharacters = (customPrompt?: string, customSpeech?: string, targetPanel?: MangaPanel) => {
    const panel = targetPanel || activePanel;
    const actionPrompt = customPrompt !== undefined ? customPrompt : panel.actionPrompt;
    const speechText = customSpeech !== undefined ? customSpeech : panel.speechText;
    if (!actionPrompt) return;
    
    const detected: string[] = [];
    const fullText = `${actionPrompt} ${speechText || ''}`.toLowerCase();
    
    const escapeRegExp = (str: string): string => {
      return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    };
    
    const stopWords = new Set([
      'the', 'and', 'for', 'you', 'with', 'she', 'him', 'her', 'his', 'man', 'boy', 'girl', 
      'sir', 'doc', 'mrs', 'ms', 'mr', 'who', 'has', 'had', 'was', 'this', 'that', 'they', 'them',
      'some', 'someone', 'their', 'there', 'about', 'from', 'into', 'out', 'here', 'your', 'then',
      'will', 'would', 'could', 'should', 'have', 'been', 'were', 'are', 'is', 'am', 'be', 'of'
    ]);

    characters.forEach(char => {
      const charNameLower = char.name.toLowerCase();
      // 1. Direct full name match with word boundaries
      try {
        const fullReg = new RegExp('\\b' + escapeRegExp(charNameLower) + '\\b', 'i');
        if (fullReg.test(fullText)) {
          detected.push(char.name);
          return;
        }
      } catch (e) {
        // Fallback to substring check if regex compilation fails due to exotic characters
        if (fullText.includes(charNameLower)) {
          detected.push(char.name);
          return;
        }
      }

      // 2. Split names into components (e.g. "Kenji Sato" -> ["Kenji", "Sato"]) to match first name or last name
      const parts = char.name.split(/[\s\-_,.]+/).map(p => p.trim().toLowerCase()).filter(p => p.length >= 2 && !stopWords.has(p));
      const hasPartMatch = parts.some(part => {
        try {
          const partReg = new RegExp('\\b' + escapeRegExp(part) + '\\b', 'i');
          return partReg.test(fullText);
        } catch (e) {
          return fullText.includes(part);
        }
      });

      if (hasPartMatch) {
        detected.push(char.name);
      }
    });

    if (detected.length > 0) {
      const merged = Array.from(new Set([...(panel.charactersPresent || []), ...detected])).slice(0, 3);
      const matchedFirst = characters.find(c => c.name.toLowerCase() === merged[0].toLowerCase());
      handleUpdatePanel(panel.id, {
        charactersPresent: merged,
        charSheetUrl: matchedFirst ? (matchedFirst.turnaround_url || matchedFirst.reference_images?.[0] || panel.charSheetUrl) : panel.charSheetUrl
      });
    }
  };

  const handleSelectPanel = (panelId: string) => {
    setSelectedPanelId(panelId);
    const target = panels.find(p => p.id === panelId);
    if (target && (!target.charactersPresent || target.charactersPresent.length === 0)) {
      handleAutoDetectCharacters(undefined, undefined, target);
    }
  };

  // Step 3: SiliconFlow / ApiFrame Qwen-Image-Edit Composition with True Multi-Reference Blending
  const handleRenderPanelWithQwen = async () => {
    setIsRenderingPanel(true);
    handleUpdatePanel(activePanel.id, { renderingStatus: 'GENERATING' });
    
    try {
      // 1. Collect all characters present in this panel
      const charNames = (activePanel.charactersPresent && activePanel.charactersPresent.length > 0)
        ? activePanel.charactersPresent
        : [];

      let currentCharsList = [...characters];

      const matchedChars: Character[] = [];
      const charDescriptions: string[] = [];
      const referenceImageUrls: string[] = [];

      // 1. Background Environment as Reference 1 (Base Plate)
      if (activePanel.bgUrl && (activePanel.bgUrl.startsWith('http://') || activePanel.bgUrl.startsWith('https://'))) {
        referenceImageUrls.push(activePanel.bgUrl);
      }

      // 2. Character Model Sheets as Reference 2+ (Identity Anchors)
      charNames.forEach((name, idx) => {
        const cleanName = name.trim();
        if (!cleanName) return;
        const matched = currentCharsList.find(c => c.name.toLowerCase() === cleanName.toLowerCase());
        
        const enrichedDesc = (matched?.visual_descriptor && matched.visual_descriptor.length >= 80)
          ? matched.visual_descriptor
          : getCharacterAutofillDescriptor(cleanName);

        if (matched) {
          matchedChars.push(matched);
          charDescriptions.push(`Character ${idx + 1} [${matched.name}]: ${enrichedDesc}`);
          const refUrl = matched.turnaround_url || matched.reference_images?.[0];
          if (refUrl && (refUrl.startsWith('http://') || refUrl.startsWith('https://')) && !referenceImageUrls.includes(refUrl)) {
            referenceImageUrls.push(refUrl);
          }
        } else {
          charDescriptions.push(`Character ${idx + 1} [${cleanName}]: ${enrichedDesc}`);
        }
      });

      // Also include activePanel.charSheetUrl if valid and not already added
      if (activePanel.charSheetUrl && (activePanel.charSheetUrl.startsWith('http://') || activePanel.charSheetUrl.startsWith('https://')) && !referenceImageUrls.includes(activePanel.charSheetUrl)) {
        referenceImageUrls.push(activePanel.charSheetUrl);
      }

      const matchedEnv = environments.find(e => e.master_keyframe_url === activePanel.bgUrl || e.id === activePanel.bgUrl);
      const envLocationName = matchedEnv ? matchedEnv.location_name : 'Atmospheric Scene Stage';

      // 3. Dispatch to dedicated manga panel multi-reference blender
      const response = await fetch('/api/manga/render-panel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bg_url: activePanel.bgUrl || '',
          char_sheet_urls: referenceImageUrls.slice(1), // character model sheets
          action_prompt: activePanel.actionPrompt,
          expression: activePanel.expression,
          equipment: activePanel.equipment,
          camera_angle: activePanel.layoutClass.includes('col-span-12') ? 'Wide cinematic establishing angle' : 'Dynamic mid-shot perspective',
          framing: 'Authentic Japanese Seinen Gekiga Manga panel',
          location_name: envLocationName,
          characters_present: activePanel.charactersPresent,
          series_title: activeSeries?.title || '',
          world_setting: activeSeries?.global_lore || '',
          aspect_ratio: '16:9'
        })
      });

      let data = await response.json();

      // Fallback to direct qwen image edit if needed
      if (!data.success) {
        const fallbackRes = await fetch('/api/assets/qwen-image-edit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            source_image_url: activePanel.bgUrl || '',
            reference_image_urls: referenceImageUrls,
            media_inputs: referenceImageUrls,
            edit_prompt: `Masterpiece Japanese Seinen Gekiga manga panel illustration. Blend background plate with character model sheet: ${activePanel.actionPrompt}. Pure black and white ink lineart, halftone screentones.`,
            is_manga: true,
            strength: 0.85,
            aspect_ratio: '16:9'
          })
        });
        data = await fallbackRes.json();
      }

      if (data.success && (data.image_url || data.edited_image_url)) {
        handleUpdatePanel(activePanel.id, {
          isRendered: true,
          renderingStatus: 'COMPLETED',
          imageUrl: data.image_url || data.edited_image_url
        });
      } else {
        throw new Error(data.error || "Panel rendering returned empty response");
      }
    } catch (err: any) {
      console.error("Qwen panel rendering failed:", err);
      handleUpdatePanel(activePanel.id, {
        renderingStatus: 'IDLE'
      });
      alert(`Panel generation failed: ${err.message || 'Please check your character references and network connectivity'}`);
    } finally {
      setIsRenderingPanel(false);
    }
  };

  // High-Res DOM Capture Helper
  const captureFullPage = async (): Promise<string | undefined> => {
    try {
      const pageNode = document.getElementById('manga-page-grid');
      if (!pageNode) return undefined;
      
      // Temporarily hide UI elements that shouldn't appear in final print output
      const editButtons = pageNode.querySelectorAll('.group-hover\\:opacity-100, .group\\/footer button');
      editButtons.forEach(el => el.classList.add('invisible'));

      const canvas = await html2canvas(pageNode, { 
        useCORS: true, 
        scale: 2.5, 
        backgroundColor: '#ffffff',
        logging: false
      });

      editButtons.forEach(el => el.classList.remove('invisible'));

      return canvas.toDataURL('image/jpeg', 0.92);
    } catch (err) {
      console.error("Failed to capture page:", err);
      return undefined;
    }
  };

  const downloadDataUrl = (dataUrl: string, filename: string) => {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Step 4: Live Assembly & High-Res Snapshot
  const handleAssemblePage = async () => {
    setIsAssemblingPage(true);
    showToast("Assembling live high-res manga page...");

    // Brief pause for UI rendering stabilization
    await new Promise(r => setTimeout(r, 120));

    const dataUrl = await captureFullPage();
    setIsAssemblingPage(false);

    if (!dataUrl) {
      alert("Failed to assemble live page. Please ensure the page layout grid is visible.");
      return;
    }

    // Store in active pages array
    const updatedPages = [...pages];
    if (updatedPages[activePageIndex]) {
      updatedPages[activePageIndex] = {
        ...updatedPages[activePageIndex],
        panels: [...panels],
        pageImageObj: dataUrl
      };
      setPages(updatedPages);
    }

    // Sync with historyPages
    setHistoryPages(prev => {
      const existingIdx = prev.findIndex(p => p.pageNumber === currentPage && p.chapterNumber === currentChapter);
      const newRecord: MangaPageRecord = {
        id: pages[activePageIndex]?.id || `page_${currentPage}_${Date.now()}`,
        chapterNumber: currentChapter,
        pageNumber: currentPage,
        panels: [...panels],
        pageImageObj: dataUrl
      };
      if (existingIdx >= 0) {
        const copy = [...prev];
        copy[existingIdx] = newRecord;
        return copy;
      }
      return [...prev, newRecord];
    });

    // Open Live Assembled Page Modal
    setAssembledPageModal({
      pageImageObj: dataUrl,
      pageNumber: currentPage,
      chapterNumber: currentChapter,
      title: activeSeries?.title || 'Manga Page'
    });

    showToast("✨ Page Assembled & Saved Live!");
  };

  // Copy Assembled Page Image
  const handleCopyAssembledImage = async (dataUrl: string) => {
    try {
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type]: blob })
      ]);
      showToast("📋 Assembled Page copied to clipboard!");
    } catch (err) {
      console.error("Clipboard write failed:", err);
      showToast("Downloading image instead...");
      downloadDataUrl(dataUrl, `manga_c${currentChapter}_p${currentPage}.jpg`);
    }
  };

  // Export Chapter as ZIP Package
  const handleExportChapterZip = async () => {
    setIsExportingZip(true);
    showToast("Bundling chapter pages into ZIP archive...");

    try {
      const zip = new JSZip();
      const safeTitle = (activeSeries?.title || 'Manga').replace(/[^a-zA-Z0-9_\-]/g, '_');
      const chapterFolder = zip.folder(`Chapter_${currentChapter}_${safeTitle}`);

      // Map pages to ensure deduplicated, sequential list
      const pageMap = new Map<number, { pageNumber: number; chapterNumber: number; dataUrl?: string; panels: MangaPanel[] }>();

      // Load history pages for current chapter
      historyPages.forEach(hp => {
        if (hp.chapterNumber === currentChapter) {
          pageMap.set(hp.pageNumber, {
            pageNumber: hp.pageNumber,
            chapterNumber: hp.chapterNumber,
            dataUrl: hp.pageImageObj,
            panels: hp.panels
          });
        }
      });

      // Include active page
      const activeDataUrl = await captureFullPage();
      pageMap.set(currentPage, {
        pageNumber: currentPage,
        chapterNumber: currentChapter,
        dataUrl: activeDataUrl || pages[activePageIndex]?.pageImageObj,
        panels: [...panels]
      });

      const pagesArray = Array.from(pageMap.values()).sort((a, b) => a.pageNumber - b.pageNumber);

      if (pagesArray.length === 0) {
        alert("No pages found in this chapter to export.");
        setIsExportingZip(false);
        return;
      }

      for (const p of pagesArray) {
        let imgData = p.dataUrl;
        if (!imgData && p.pageNumber === currentPage) {
          imgData = activeDataUrl;
        }
        if (imgData) {
          const base64Content = imgData.split(',')[1];
          const fileName = `Page_${String(p.pageNumber).padStart(2, '0')}.jpg`;
          chapterFolder?.file(fileName, base64Content, { base64: true });
        }
      }

      // Add Manifest Metadata
      const manifest = {
        series: activeSeries?.title || 'Untitled Series',
        chapterNumber: currentChapter,
        totalPages: pagesArray.length,
        exportedAt: new Date().toISOString(),
        pages: pagesArray.map(p => ({
          pageNumber: p.pageNumber,
          panelCount: p.panels.length,
          panels: p.panels.map(panel => ({
            actionPrompt: panel.actionPrompt,
            speechText: panel.speechText,
            charactersPresent: panel.charactersPresent
          }))
        }))
      };

      zip.file('chapter_manifest.json', JSON.stringify(manifest, null, 2));

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const downloadUrl = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${safeTitle}_Chapter_${currentChapter}_FullExport.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);

      showToast(`📦 Chapter ${currentChapter} ZIP Export Downloaded!`);
    } catch (err) {
      console.error("Failed to export ZIP:", err);
      alert("Failed to create chapter ZIP export.");
    } finally {
      setIsExportingZip(false);
    }
  };

  const handleSavePanel = async (panelId: string, index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const panelNode = document.getElementById(`manga-panel-${panelId}`);
      if (!panelNode) return;
      
      const originalRing = panelNode.className;
      panelNode.className = panelNode.className.replace(/ring-[^\s]+/g, '').replace(/border-rose-500/g, 'border-transparent');
      
      const canvas = await html2canvas(panelNode, { useCORS: true, scale: 2.5 });
      panelNode.className = originalRing;
      
      downloadDataUrl(canvas.toDataURL('image/jpeg', 0.92), `chapter${currentChapter}_page${currentPage}_panel${index + 1}.jpg`);
      showToast(`Downloaded Panel #${index + 1}`);
    } catch (err) {
      console.error("Failed to export panel:", err);
      alert("Failed to export panel image.");
    }
  };

  const handleSaveFullChapter = () => {
    handleExportChapterZip();
  };

  const handleNextPage = async () => {
    if (mangaScope === 'single_page') {
      await handleAssemblePage();
      showToast("Single Page completed & assembled!");
      return;
    }
    
    setIsCapturing(true);
    const capturedDataUrl = await captureFullPage();
    setIsCapturing(false);

    // Save current page state
    const updatedPages = [...pages];
    updatedPages[activePageIndex] = {
      ...updatedPages[activePageIndex],
      panels: [...panels],
      pageImageObj: capturedDataUrl
    };
    setPages(updatedPages);

    if (activePageIndex < pages.length - 1) {
      handleSwitchPage(activePageIndex + 1);
      setActiveWorkflowStep(3);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      showToast(`Switched to Page ${activePageIndex + 2}`);
    } else {
      setHistoryPages(prev => [...prev, ...updatedPages]);
      setShowChapterPreview(true);
      showToast("🎉 Chapter complete! All pages saved to history.");
    }
  };

  // Helper to dynamically compile visual details from step-by-step consistency fields
  const assembleGuidedDescriptor = (): string => {
    const genderAge = charDemographic === 'custom' ? charDemographicCustom : charDemographic;
    const hairStyle = charHair === 'custom' ? charHairCustom : charHair;
    const eyeStyle = charEyes === 'custom' ? charEyesCustom : charEyes;
    const faceStyle = charFace === 'custom' ? charFaceCustom : charFace;
    
    let attireStyle = '';
    if (charAttire === 'smart-auto') {
      const genre = detectProjectGenre();
      if (genre === 'ANCIENT') {
        attireStyle = "Traditional battle-worn dark samurai haori and tailored hakama trousers covering full body, authentic to feudal setting.";
      } else if (genre === 'FANTASY') {
        attireStyle = "Elegant reinforced silver-mythril plate armor with a high-collared neck guard and flowing velvet mantle.";
      } else if (genre === 'CYBERPUNK') {
        attireStyle = "Sleek matte-black high-neck tactical trenchcoat with luminescent seam piping and carbon-fiber armor.";
      } else {
        attireStyle = "Smart modern dark charcoal overcoat over a black high-neck tactical turtleneck and combat trousers.";
      }
    } else if (charAttire === 'custom') {
      attireStyle = charAttireCustom;
    } else {
      attireStyle = charAttire;
    }

    return `Primary Character Concept: "${genderAge} named ${mangaCharName}".
• Age, Demographic & Proportions: Must be rendered strictly as ${genderAge}. Maintain 100% accurate structural height and anatomy.
• Hairstyle & Color: ${hairStyle || 'Neatly styled hair appropriate to the character setting'}.
• Eye Shape & Expression: ${eyeStyle || 'Piercing and expressive gaze with clear emotional focus'}.
• Facial Architecture: ${faceStyle || 'Clear defined facial structure with natural lighting shadows'}.
• Signature Wardrobe: ${attireStyle || 'Cohesive period-accurate clothing covering full body'}.`;
  };

  // Real API integrations for character turnaround sheet generation
  const handleGenerateMangaCharacter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mangaCharName.trim()) return;

    let finalDescriptor = '';
    if (characterBuilderMode === 'guided') {
      if (charDemographic === 'custom' && !charDemographicCustom.trim()) {
        alert("Please enter custom age & demographic details.");
        return;
      }
      if (charHair === 'custom' && !charHairCustom.trim()) {
        alert("Please enter custom hairstyle details.");
        return;
      }
      if (charEyes === 'custom' && !charEyesCustom.trim()) {
        alert("Please enter custom eye specifications.");
        return;
      }
      if (charFace === 'custom' && !charFaceCustom.trim()) {
        alert("Please enter custom facial characteristics.");
        return;
      }
      if (charAttire === 'custom' && !charAttireCustom.trim()) {
        alert("Please enter custom wardrobe specifications.");
        return;
      }
      finalDescriptor = assembleGuidedDescriptor();
    } else {
      if (!mangaCharDescriptor.trim()) return;
      finalDescriptor = mangaCharDescriptor;
    }

    setIsGeneratingMangaChar(true);
    try {
      const response = await fetch('/api/assets/characters/turnaround', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: mangaCharName,
          visual_descriptor: finalDescriptor + ", classic monochrome Gekiga manga style, screentone, pure black and white line-art, model sheet turnaround layout",
          fish_voice_token: mangaCharVoice,
          series_id: activeSeries?.id || 'ser_manga_default',
          art_style_seed: 'GEKIGA_INK_WASH_MONOCHROME_HIGH_CONTRAST',
          series_title: activeSeries?.title,
          world_setting: activeSeries?.description
        })
      });
      const data = await response.json();
      if (data.success && data.character) {
        onAddCharacter(data.character);
        // Automatically link the newly created character sheet to the active panel
        handleUpdatePanel(activePanel.id, {
          charSheetUrl: data.character.turnaround_url,
          charactersPresent: [data.character.name]
        });
        setMangaCharName('');
      } else {
        alert(data.error || "Failed to generate character turnaround sheet");
      }
    } catch (err) {
      console.error(err);
      alert("Error generating character turnaround sheet");
    } finally {
      setIsGeneratingMangaChar(false);
    }
  };

  // Real API integrations for consistent layout background generation
  const handleGenerateMangaEnvironment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mangaEnvLocation.trim() || !mangaEnvStyle.trim()) return;
    setIsGeneratingMangaEnv(true);
    try {
      const response = await fetch('/api/assets/environments/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location_name: mangaEnvLocation,
          style_descriptor: mangaEnvStyle + ", high contrast black and white Gekiga manga illustration background, clean screentone, no people, empty stage layout",
          art_style_seed: 'GEKIGA_INK_WASH_MONOCHROME_HIGH_CONTRAST',
          series_id: activeSeries?.id || 'ser_manga_default',
          series_title: activeSeries?.title,
          world_setting: activeSeries?.description
        })
      });
      const data = await response.json();
      if (data.success && data.environment) {
        onAddEnvironment(data.environment);
        // Automatically link background to active panel
        handleUpdatePanel(activePanel.id, {
          bgUrl: data.environment.master_keyframe_url
        });
        setMangaEnvLocation('');
      } else {
        alert(data.error || "Failed to generate manga background layout");
      }
    } catch (err) {
      console.error(err);
      alert("Error generating manga background");
    } finally {
      setIsGeneratingMangaEnv(false);
    }
  };

  // Build the copyable JSON payload matching the expert's schema
  const generateSiliconFlowPayload = (): string => {
    const presentChars = activePanel.charactersPresent || [];
    const matchedRefImages = presentChars.map(name => {
      const c = characters.find(char => char.name.toLowerCase() === name.toLowerCase());
      return {
        name,
        turnaround_url: c?.turnaround_url || c?.reference_images?.[0] || '',
        descriptor: c?.visual_descriptor || ''
      };
    });

    const payload = {
      model: "Qwen/Qwen-Image-Edit",
      prompt: `Black and white manga illustration style, clean line art, screentone shading, highly detailed. Action: ${activePanel.actionPrompt}. Expressing: ${activePanel.expression}`,
      image: activePanel.bgUrl,
      reference_images: matchedRefImages.map(r => r.turnaround_url).filter(Boolean),
      characters_present: presentChars,
      character_details: matchedRefImages,
      num_inference_steps: 25,
      cfg: 5.0,
      speech_bubble_metadata: {
        text: activePanel.speechText,
        bubble_type: activePanel.bubbleStyle,
        position_percent: {
          x: activePanel.bubbleX,
          y: activePanel.bubbleY
        },
        scale: activePanel.bubbleScale
      }
    };
    return JSON.stringify(payload, null, 2);
  };

  const handleCopyPayload = () => {
    navigator.clipboard.writeText(generateSiliconFlowPayload());
    setCopiedPayload(true);
    setTimeout(() => setCopiedPayload(false), 2000);
  };

  // Render SVG speech bubbles on top of the image to look like a real manga page
  const renderSpeechBubbleSVG = (panel: MangaPanel, pagePanelsCount = 3) => {
    const text = panel.speechText?.trim() || "";
    
    // Smart filter to identify if there is genuinely dialogue or not.
    // Standard placeholders like "Dialogue goes here..." or "(No Speech)" should be ignored.
    const isPlaceholder = !text || 
                          text.toLowerCase() === "dialogue goes here..." || 
                          text.toLowerCase() === "dialogue goes here" ||
                          text.toLowerCase() === "(dialogue)" ||
                          text.toLowerCase() === "dialogue" ||
                          text.toLowerCase() === "(no speech)" ||
                          text.toLowerCase() === "(silence)" ||
                          text.toLowerCase() === "silence" ||
                          text === "...";

    if (isPlaceholder) {
      return null;
    }

    // Dynamic scale factor based on number of panels on the page
    // Less panels = larger images = larger bubble scale is fine
    // More panels = smaller panel boxes = bubble scale MUST be smaller to prevent obscuring the panel art
    let baseScale = panel.bubbleScale || 1.0;
    
    if (pagePanelsCount >= 4) {
      baseScale *= 0.82; // Balanced scale to fit neatly in tight grid squares
    } else if (pagePanelsCount === 3) {
      baseScale *= 0.88; // Perfectly scaled for 3-panel configurations
    } else if (pagePanelsCount === 2) {
      baseScale *= 0.94; // Optimized for 2-panel configuration
    } else {
      baseScale *= 1.0; // 1-panel full-page splash
    }

    // Proportional scale floor to guarantee ultimate legibility and stop microscopic text sizes
    baseScale = Math.max(0.85, baseScale);

    // Professional oval-shaping wrapping algorithm
    // Stacks words beautifully in a diamond/oval shape to conform perfectly to Gekiga comic margins
    const getOvalBalancedLines = (str: string): string[] => {
      const words = str.split(/\s+/);
      if (words.length <= 1) return [str];
      if (words.length === 2) return [words[0], words[1]];
      
      const totalChars = str.length;
      let targetLines = 2;
      if (totalChars <= 12) targetLines = 1;
      else if (totalChars <= 28) targetLines = 2;
      else if (totalChars <= 55) targetLines = 3;
      else targetLines = 4;
      
      const lines: string[][] = Array.from({ length: targetLines }, () => []);
      const avgCharsPerLine = totalChars / targetLines;
      
      const getLineWeight = (idx: number, total: number) => {
        if (total <= 2) return 1.0;
        const mid = (total - 1) / 2;
        const distFromMid = Math.abs(idx - mid);
        return 1.3 - (distFromMid * 0.35); // wider at the middle, narrower at the edges
      };
      
      let wordIdx = 0;
      for (let l = 0; l < targetLines; l++) {
        const weight = getLineWeight(l, targetLines);
        const targetLen = avgCharsPerLine * weight;
        let currentLen = 0;
        
        while (wordIdx < words.length) {
          const nextWord = words[wordIdx];
          const addedLen = nextWord.length + (currentLen > 0 ? 1 : 0);
          
          if (currentLen === 0 || (currentLen + addedLen <= targetLen + 4) || l === targetLines - 1) {
            lines[l].push(nextWord);
            currentLen += addedLen;
            wordIdx++;
          } else {
            break;
          }
        }
      }
      return lines.map(lineWords => lineWords.join(" ")).filter(Boolean);
    };

    const textLines = getOvalBalancedLines(text);
    const isShort = text.length <= 10;
    const isSingleLine = textLines.length === 1;

    return (
      <div 
        className="absolute pointer-events-none select-none z-30 drop-shadow-md animate-fadeIn"
        style={{
          left: `${panel.bubbleX}%`,
          top: `${panel.bubbleY}%`,
          transform: `translate(-50%, -50%) scale(${baseScale})`,
          maxWidth: isShort ? '120px' : '185px',
        }}
      >
        <div className="relative flex flex-col items-center justify-center">
          {/* Main Bubble body */}
          {panel.bubbleStyle === 'burst' ? (
            // Aggressive, world-class starburst action bubble
            <div 
              className="bg-white text-black font-extrabold tracking-wide uppercase text-center flex flex-col items-center justify-center border-4 border-black relative shadow-lg"
              style={{
                clipPath: 'polygon(0% 15%, 15% 15%, 25% 0%, 35% 15%, 50% 5%, 65% 15%, 75% 0%, 85% 15%, 100% 15%, 90% 35%, 100% 50%, 90% 65%, 100% 80%, 85% 80%, 75% 100%, 65% 80%, 50% 95%, 35% 80%, 25% 100%, 15% 80%, 0% 80%, 10% 65%, 0% 50%, 10% 35%)',
                padding: '20px 24px',
                fontSize: '11.5px',
                fontFamily: 'system-ui, -apple-system, sans-serif',
                lineHeight: '1.25',
                width: 'max-content',
                minWidth: '95px',
                minHeight: '70px',
              }}
            >
              {textLines.map((line, i) => (
                <div key={i} className="whitespace-nowrap font-black">{line}</div>
              ))}
            </div>
          ) : (
            // Classic professional rounded ellipse dialog
            <div 
              className={`bg-white text-black font-bold tracking-wide uppercase text-center flex flex-col items-center justify-center select-none shadow-md border-[3px] border-black ${
                panel.bubbleStyle === 'whisper' 
                  ? 'border-dashed border-slate-500 rounded-[50%/40%] text-slate-800' 
                  : 'rounded-[50%/45%]'
              }`}
              style={{
                padding: isShort 
                  ? (isSingleLine ? '8px 16px' : '10px 18px') 
                  : '14px 22px',
                fontSize: isShort ? '11px' : '12px',
                fontFamily: 'system-ui, -apple-system, sans-serif',
                lineHeight: '1.25',
                width: 'max-content',
                minWidth: isShort ? '65px' : '110px',
                minHeight: isShort ? '40px' : '60px',
              }}
            >
              {textLines.map((line, i) => (
                <div key={i} className="whitespace-nowrap">{line}</div>
              ))}
              
              {/* Dialogue Bubble tail pointing down towards speaker */}
              {panel.bubbleStyle === 'oval' && (
                <div className="absolute bottom-[-10px] left-[35%] w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[10px] border-t-white before:absolute before:bottom-[1px] before:left-[-10px] before:w-0 before:h-0 before:border-l-[10px] before:border-l-transparent before:border-r-[10px] before:border-r-transparent before:border-t-[10px] before:border-t-black before:z-[-1]"></div>
              )}
            </div>
          )}

          {/* Thought trail circles descending from the main bubble */}
          {panel.bubbleStyle === 'thought' && (
            <div className="absolute bottom-[-16px] left-[45%] flex flex-col gap-1 items-center">
              <div className="w-3.5 h-3.5 bg-white border-2 border-black rounded-full shadow-sm"></div>
              <div className="w-2 h-2 bg-white border-2 border-black rounded-full shadow-sm"></div>
              <div className="w-1 h-1 bg-white border border-black rounded-full shadow-sm"></div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* BRAND HEADER & DESCRIPTION */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-rose-500 to-amber-500 p-0.5 shadow-lg shadow-rose-500/10">
            <div className="h-full w-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-rose-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-white font-['Cinzel',serif] tracking-tight">
                AI Manga Studio App
              </h1>
              <span className="px-2 py-0.5 text-[9px] font-mono tracking-widest font-bold uppercase rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/30">
                Route C • Expert Mode
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Fully decoupled Reference-Conditioned Pipeline for absolute character continuity and layout locking.
              Using the decoupled Multi-Reference Architecture designed for Seedance, deploy the prepaid <span className="text-slate-200 font-semibold">Qwen-Image-Edit</span> pipeline over unchanging character sheets to render perfect manga panel continuity at a fraction of the cost.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto shrink-0 border-t md:border-t-0 pt-4 md:pt-0 border-slate-800">
          <button
            onClick={() => setIsCharacterVaultOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-semibold transition-all"
            title="Smart Character & Environment Vault"
          >
            <UserCheck className="h-3.5 w-3.5 text-amber-400" />
            <span>Character Vault</span>
          </button>
          <button
            onClick={() => setIsPanelVaultOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-semibold transition-all"
            title="Smart Panel Storage Vault"
          >
            <ImageIcon className="h-3.5 w-3.5 text-emerald-400" />
            <span>Panel Vault</span>
          </button>
          <button
            onClick={() => setIsChaptersGalleryOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-semibold transition-all"
            title="Chapters, Pages & Stories Gallery"
          >
            <Layers className="h-3.5 w-3.5 text-indigo-400" />
            <span>Chapters Gallery</span>
          </button>
          <button
            onClick={() => {
              setIsStorageHubOpen(true);
              fetchStorageFiles();
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-semibold transition-all"
            title="Vercel Cloud Storage & Neon DB Sync Hub"
          >
            <Cloud className="h-3.5 w-3.5 text-sky-400 animate-pulse" />
            <span>Cloud Sync Hub</span>
          </button>
          <button
            onClick={onBackToHome}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-semibold transition-all"
          >
            <ArrowLeft className="h-3.5 w-3.5 text-rose-400" />
            <span>Studio Hub</span>
          </button>

          <button
            onClick={handleAssemblePage}
            disabled={isAssemblingPage}
            className="flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white text-xs font-bold shadow-md shadow-rose-600/30 transition-all active:scale-95 cursor-pointer"
          >
            {isAssemblingPage ? (
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Printer className="h-3.5 w-3.5" />
            )}
            <span>Assemble Page (Pillow)</span>
          </button>
        </div>
      </div>

      {/* CONTINUOUS MANGA SCOPE SELECTOR */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-slate-300">Manga Generation Scope:</label>
          <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-800">
            <button 
              onClick={() => setMangaScope('single_page')}
              className={`px-3 py-1.5 rounded-md text-[11px] font-mono transition-all ${mangaScope === 'single_page' ? 'bg-rose-500 text-white font-bold shadow-md shadow-rose-500/20' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Single Page
            </button>
            <button 
              onClick={() => setMangaScope('single_chapter')}
              className={`px-3 py-1.5 rounded-md text-[11px] font-mono transition-all ${mangaScope === 'single_chapter' ? 'bg-rose-500 text-white font-bold shadow-md shadow-rose-500/20' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Single Chapter
            </button>
            <button 
              onClick={() => setMangaScope('full_story')}
              className={`px-3 py-1.5 rounded-md text-[11px] font-mono transition-all ${mangaScope === 'full_story' ? 'bg-rose-500 text-white font-bold shadow-md shadow-rose-500/20' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Full Story
            </button>
          </div>
        </div>
        
        {mangaScope !== 'single_page' && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-4 text-[11px] font-mono text-slate-300 bg-slate-900 px-4 py-2 rounded-lg border border-slate-800">
              {mangaScope === 'full_story' && (
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">Chapter:</span>
                  <span className="font-bold text-rose-400 text-sm">{currentChapter}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <span className="text-slate-500">Page:</span>
                <span className="font-bold text-emerald-400 text-sm">{currentPage}</span>
              </div>
            </div>
            
            {historyPages.length > 0 && (
              <button 
                onClick={() => setShowChapterPreview(true)}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-lg shadow-indigo-500/20"
              >
                <Layers className="h-4 w-4" />
                <span>Chapter History ({historyPages.length})</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* DETAILED WORKFLOW STEP TRACKER */}
      <div className="grid grid-cols-4 gap-2 bg-slate-900/60 p-2 rounded-2xl border border-slate-800/80">
        {[
          { step: 1, label: 'Plot & Pacing', sub: 'DeepSeek-R1 Script', icon: Layout },
          { step: 2, label: 'Character Vault', sub: 'Turnaround Sheets', icon: UserCheck },
          { step: 3, label: 'Panel Rendering', sub: 'Qwen-Image-Edit', icon: ImageIcon },
          { step: 4, label: 'Local Assembly', sub: 'Pillow Canvas Overlay', icon: MessageSquare }
        ].map((item) => {
          const isActive = activeWorkflowStep === item.step;
          const isCompleted = activeWorkflowStep > item.step;
          return (
            <button
              key={item.step}
              onClick={() => setActiveWorkflowStep(item.step)}
              className={`flex flex-col sm:flex-row items-center gap-3 px-4 py-3 rounded-xl transition-all text-left group cursor-pointer ${
                isActive 
                  ? 'bg-rose-500/10 border border-rose-500/40 shadow-sm shadow-rose-500/5' 
                  : 'border border-transparent hover:bg-slate-900/40'
              }`}
            >
              <div className={`h-8 w-8 rounded-lg shrink-0 flex items-center justify-center transition-all ${
                isActive 
                  ? 'bg-rose-500 text-slate-950 font-bold scale-105' 
                  : isCompleted 
                  ? 'bg-rose-950/40 text-rose-400 border border-rose-500/30' 
                  : 'bg-slate-800 text-slate-400'
              }`}>
                {isCompleted ? <CheckCircle2 className="h-4 w-4" /> : <item.icon className="h-4 w-4" />}
              </div>
              <div className="hidden sm:block text-left">
                <span className={`block text-xs font-bold leading-none ${isActive ? 'text-rose-300' : 'text-slate-300'}`}>
                  Step {item.step}: {item.label}
                </span>
                <span className="text-[10px] text-slate-500 font-mono block mt-0.5">{item.sub}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* MAIN WORKSPACE GRAPHICS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: THE MANGA PAGE CANVAS PREVIEW (7-Columns) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            
            {/* CANVAS HEADER CONTROLS */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800/80 pb-4 gap-4">
              <div className="flex items-center gap-2">
                <Layout className="h-4 w-4 text-rose-400" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                  Manga Page Grid Layout (Page {activePageIndex + 1} of {pages.length || 1})
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                {activeWorkflowStep === 3 && (
                  <button 
                    onClick={handleAddPanelManual}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-bold rounded-lg border border-slate-700 transition-all"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-rose-400" />
                    <span>Add Panel</span>
                  </button>
                )}
                
                {pages.length > 1 && (
                  <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
                    <button 
                      onClick={() => handleSwitchPage(activePageIndex - 1)}
                      disabled={activePageIndex === 0}
                      className="p-1 hover:bg-slate-800 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <ArrowLeft className="h-4 w-4 text-slate-400" />
                    </button>
                    <div className="flex gap-1 px-2">
                      {pages.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSwitchPage(idx)}
                          className={`h-2 w-2 rounded-full transition-all ${activePageIndex === idx ? 'bg-rose-500 w-4' : 'bg-slate-700 hover:bg-slate-500'}`}
                          title={`Go to Page ${idx + 1}`}
                        />
                      ))}
                    </div>
                    <button 
                      onClick={() => handleSwitchPage(activePageIndex + 1)}
                      disabled={activePageIndex === pages.length - 1}
                      className="p-1 hover:bg-slate-800 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <ArrowRight className="h-4 w-4 text-slate-400" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* PAGE-LEVEL LAYOUT TEMPLATE SELECTOR TOOLBAR */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3 mt-3 shadow-inner">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-rose-400 font-mono flex items-center gap-1.5">
                  <Layout className="h-4 w-4" />
                  Select Page Layout Template
                </span>
                <span className="text-[10px] text-slate-500 font-mono font-bold bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
                  Active Page Panels: <span className="text-emerald-400 font-black">{panels.length}</span>
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                {MANGA_LAYOUT_TEMPLATES.map((tpl) => {
                  const isCompatible = tpl.requiredPanels === null || tpl.requiredPanels === panels.length;
                  const isActive = getActivePageTemplate() === tpl.id && isCompatible;

                  return (
                    <button
                      key={tpl.id}
                      type="button"
                      disabled={!isCompatible}
                      onClick={() => handleTemplateChange(tpl.id)}
                      title={isCompatible 
                        ? `${tpl.label}: ${tpl.desc}` 
                        : `${tpl.label} requires ${tpl.requiredPanels} panels (Active page has ${panels.length} panels)`}
                      className={`text-[10px] py-2 px-1.5 border-2 rounded-xl transition-all flex flex-col items-center justify-between text-center font-bold font-mono h-14 leading-tight relative overflow-hidden ${
                        isActive 
                          ? 'bg-rose-500/15 border-rose-500 text-rose-300 shadow-lg shadow-rose-500/10 cursor-pointer' 
                          : isCompatible
                          ? 'bg-slate-900/80 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 cursor-pointer'
                          : 'bg-slate-950/40 border-slate-900/60 text-slate-600 opacity-40 cursor-not-allowed select-none'
                      }`}
                    >
                      <span className="truncate w-full px-1">{tpl.label}</span>
                      <span className={`text-[8px] uppercase tracking-wider font-mono font-extrabold px-1.5 py-0.5 rounded ${
                        isActive 
                          ? 'bg-rose-500 text-white' 
                          : isCompatible 
                          ? 'bg-slate-800 text-slate-400' 
                          : 'bg-slate-900 text-slate-700'
                      }`}>
                        {tpl.tag}
                      </span>
                    </button>
                  );
                })}
              </div>

              <p className="text-[9px] text-slate-400 font-mono leading-relaxed bg-slate-900/40 p-2.5 rounded-xl border border-slate-900 flex items-center justify-between">
                <span>
                  💡 <span className="text-rose-400 font-bold">Panel-Linked Matching</span>: Layout options directly match your page's panel count ({panels.length} panels). Incompatible layout options are grayed out. <span className="text-emerald-400 font-bold">Adaptive Flow</span> supports any panel count!
                </span>
              </p>
            </div>

            {/* SAVING & FINALIZATION REMINDER BANNER */}
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex items-start gap-3.5 shadow-md">
              <div className="h-9 w-9 shrink-0 bg-amber-500/20 border border-amber-500/30 rounded-xl flex items-center justify-center text-amber-400">
                <AlertCircle className="h-5 w-5 animate-pulse" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-amber-200 flex items-center gap-2">
                  <span>Finalization & Save Notice</span>
                  <span className="text-[10px] bg-amber-500/20 px-2 py-0.5 rounded-md font-mono font-bold tracking-wider text-amber-400 border border-amber-500/30">Action Required</span>
                </h4>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  ⚠️ Remember to <strong>Save and Finalize</strong> your page! After positioning your dialogue speech bubbles, tweaking visual panels, or adjusting page content, you <strong>MUST</strong> click <span className="text-amber-400 font-semibold underline cursor-pointer hover:text-amber-300" onClick={handleAssemblePage}>"Assemble Live Page"</span>. This renders, compiles, and locks your work securely into your <strong>Vercel Neon PostgreSQL Database & Vercel Blob Cloud Storage</strong> permanently.
                </p>
              </div>
            </div>

            {/* LIVE WORKSPACE PRODUCTION ACTION BAR */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-lg">
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-mono font-bold text-slate-200">
                  Live Page {currentPage} Canvas (Chapter {currentChapter})
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleAssemblePage}
                  disabled={isAssemblingPage}
                  className="px-3.5 py-1.5 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95"
                  title="Assemble and preview high-res live canvas"
                >
                  {isAssemblingPage ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Printer className="h-3.5 w-3.5" />}
                  <span>Assemble Live Page</span>
                </button>
                <button
                  onClick={async () => {
                    showToast("Capturing active page...");
                    const dataUrl = await captureFullPage();
                    if (dataUrl) {
                      downloadDataUrl(dataUrl, `manga_c${currentChapter}_p${currentPage}.jpg`);
                      showToast(`Downloaded Page ${currentPage} JPG`);
                    } else alert("Ensure the page grid is visible to download.");
                  }}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                  title="Download current page image directly as JPG"
                >
                  <Download className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Download Page (JPG)</span>
                </button>
                <button
                  onClick={handleExportChapterZip}
                  disabled={isExportingZip}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-indigo-600/20 cursor-pointer active:scale-95"
                  title="Export all pages in chapter as a single ZIP archive"
                >
                  {isExportingZip ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Layers className="h-3.5 w-3.5 text-indigo-200" />}
                  <span>Export Chapter (ZIP)</span>
                </button>
              </div>
            </div>

            {/* MANGA GENTLEMAN GRID WORKSPACE (PORTRAIT ASPECT RATIO PRESERVED) */}
            <div 
              id="manga-page-grid" 
              className="bg-white border-8 border-black rounded-xl p-4 md:p-6 shadow-2xl relative w-full aspect-[1/1.58] max-h-[92vh] mx-auto overflow-hidden flex flex-col justify-between"
            >
              
              {/* PAGE NUMBER ACCENT (EDITABLE & MOVED DOWN) */}
              <div className="absolute bottom-1.5 left-1/2 transform -translate-x-1/2 text-[10px] font-black text-black font-mono tracking-widest uppercase z-20 flex items-center gap-1.5 group/footer whitespace-nowrap">
                {isEditingFooter ? (
                  <input
                    type="text"
                    value={mangaPageFooterText}
                    onChange={(e) => setMangaPageFooterText(e.target.value)}
                    onBlur={() => setIsEditingFooter(false)}
                    autoFocus
                    className="bg-slate-100 border border-black text-black text-[10px] px-2 py-0.5 font-mono rounded text-center outline-none shadow-sm"
                  />
                ) : (
                  <span 
                    onClick={() => setIsEditingFooter(true)}
                    className="cursor-pointer hover:bg-slate-200/90 px-2 py-0.5 rounded transition-colors"
                    title="Click to edit manga page footer text"
                  >
                    {mangaPageFooterText}
                  </span>
                )}
                <button
                  onClick={() => setIsEditingFooter(!isEditingFooter)}
                  className="opacity-0 group-hover/footer:opacity-100 text-[9px] bg-black text-white px-1.5 py-0.5 rounded transition-opacity"
                >
                  Edit
                </button>
              </div>

              {/* GRID PANEL WRAPPER */}
              <div className="flex flex-col h-full justify-between gap-2 md:gap-3 relative flex-1 mb-6">
                {getPageRows(panels, getActivePageTemplate()).map((row, rowIndex) => (
                  <div
                    key={rowIndex}
                    className="flex flex-row gap-2 md:gap-3 w-full"
                    style={{ height: row.height }}
                  >
                    {row.rowPanels.map(({ panel, width }) => {
                      if (!panel) return null;
                      const isSelected = panel.id === selectedPanelId;
                      const globalIndex = panels.findIndex(p => p.id === panel.id);
                      return (
                        <div
                          key={panel.id}
                          id={`manga-panel-${panel.id}`}
                          onClick={() => handleSelectPanel(panel.id)}
                          className={`relative overflow-hidden group cursor-pointer border-4 transition-all duration-200 h-full ${
                            isSelected 
                              ? 'border-rose-500 ring-4 ring-rose-500/20 shadow-2xl scale-[1.005] z-10' 
                              : 'border-black hover:border-slate-800'
                          }`}
                          style={{ width }}
                        >
                          {/* Save Panel Button */}
                          {panel.imageUrl && activeWorkflowStep >= 3 && (
                            <div className="absolute top-2 right-2 z-20 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeletePanel(panel.id);
                                }}
                                className="bg-rose-600/60 hover:bg-rose-600 text-white p-2 rounded-lg backdrop-blur-sm"
                                title="Delete this panel"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={(e) => handleSavePanel(panel.id, globalIndex, e)}
                                className="bg-black/60 hover:bg-black/90 text-white p-2 rounded-lg backdrop-blur-sm"
                                title="Save this panel"
                              >
                                <Download className="h-4 w-4 text-emerald-400" />
                              </button>
                            </div>
                          )}
                          {/* Black and white filter applied to match true retro Gekiga shading */}
                          <img 
                            src={panel.imageUrl} 
                            alt={`Manga panel ${panel.panelIndex}`}
                            className="w-full h-full object-cover grayscale contrast-125 brightness-95"
                            referrerPolicy="no-referrer"
                          />

                          {/* Screen tone texture overlay simulation */}
                          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-transparent to-black/10 mix-blend-multiply pointer-events-none" />

                          {/* Panel Number Badge */}
                          <div className="absolute top-2 left-2 bg-black text-white text-[10px] font-black font-mono h-5 w-5 flex items-center justify-center rounded">
                            {panel.panelIndex}
                          </div>

                          {/* Render Speech bubble Overlay */}
                          {renderSpeechBubbleSVG(panel, panels.length)}

                          {/* Selected Panel Accent */}
                          {isSelected && (
                            <div className="absolute inset-0 border-2 border-rose-500 pointer-events-none">
                              <div className="absolute bottom-2 right-2 bg-rose-500 text-white font-mono text-[9px] font-bold px-2 py-0.5 rounded tracking-wider uppercase shadow-md">
                                Selected Panel {panel.panelIndex}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>

            </div>

            {/* EXPORT OPTIONS */}
            <div className="flex items-center justify-between pt-2 text-xs font-mono text-slate-400">
              <span className="flex items-center gap-1">
                <ShieldCheck className="h-4 w-4 text-rose-400" />
                <span>Lineart & Shading fully optimized for printing.</span>
              </span>
              <div className="flex gap-2">
                <button className="text-slate-300 hover:text-white transition-colors flex items-center gap-1 p-1 bg-slate-800 rounded">
                  <Download className="h-3.5 w-3.5" /> Save PDF
                </button>
                <button className="text-slate-300 hover:text-white transition-colors flex items-center gap-1 p-1 bg-slate-800 rounded">
                  <Share2 className="h-3.5 w-3.5" /> Share Draft
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* RIGHT COLUMN: STEP CONTROLS & PIPELINE CONFIGS (5-Columns) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* STEP 1: SCRIPTING & storyboard */}
          {activeWorkflowStep === 1 && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-rose-400" />
                  <h3 className="font-bold text-slate-100 text-sm font-['Cinzel',serif]">
                    Step 1: Plot & Storyboard Layout
                  </h3>
                </div>
                <span className="text-[10px] text-rose-400 font-mono font-bold bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                  DeepSeek-R1
                </span>
              </div>

              <div className="space-y-4">
                <p className="text-xs text-slate-300 leading-relaxed">
                  Provide your raw story idea or let DeepSeek-R1 write the storyboard. The model automatically splits the dialogue and actions into structured panels, outputting layout specifications in JSON format.
                </p>

                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-300">
                    {mangaScope === 'single_page' ? 'Single Page Blueprint Concept' : mangaScope === 'full_story' ? 'Volume Saga Concept' : 'Chapter Arc Concept'}
                  </label>
                  <textarea
                    rows={4}
                    value={mangaPlotConcept}
                    onChange={(e) => setMangaPlotConcept(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:border-rose-500 font-sans leading-relaxed"
                    placeholder={
                      mangaScope === 'single_page' 
                        ? "e.g., A dramatic double-spread splash page showing Kaelen leaping from a cyber-tower. Modest tactical attire, modest..."
                        : mangaScope === 'full_story'
                        ? "e.g., A sprawling sci-fi saga starting with Kaelen discovering a hidden data matrix. All characters wear modest clothing..."
                        : "e.g., A focused chapter where Kaelen infiltrates the server core. Honorable themes, Modesty-compliant character designs..."
                    }
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-300">Layout Archetype</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Classic Seinen', 'Dramatic Shonen', 'Minimalist Gekiga', 'Action Grid'].map(arch => (
                       <button 
                        key={arch} 
                        onClick={() => setMangaArchetype(arch)}
                        className={`text-[10px] py-1.5 border rounded-lg transition-all ${
                          mangaArchetype === arch 
                            ? 'bg-rose-500/20 border-rose-500 text-rose-300' 
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                       >
                         {arch}
                       </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="space-y-1">
                    <label className="block text-[11px] font-semibold text-slate-300">Target Page Count</label>
                    <select
                      value={manualPageCount}
                      onChange={(e) => setManualPageCount(parseInt(e.target.value, 10))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-slate-100 focus:outline-none focus:border-rose-500"
                    >
                      <option value={1}>1 Page (Splash/One-Shot)</option>
                      <option value={3}>3 Pages (Standard Chapter)</option>
                      <option value={5}>5 Pages (Extended Arc)</option>
                      <option value={8}>8 Pages (Full Issue)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[11px] font-semibold text-slate-300">Panels Per Page</label>
                    <select
                      value={manualPanelsPerPage}
                      onChange={(e) => setManualPanelsPerPage(parseInt(e.target.value, 10))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-slate-100 focus:outline-none focus:border-rose-500"
                    >
                      <option value={0}>Auto / Smart Pacing</option>
                      <option value={2}>2 Panels / Page</option>
                      <option value={3}>3 Panels / Page</option>
                      <option value={4}>4 Panels / Page</option>
                      <option value={5}>5 Panels / Page</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={handleGenerateMangaScript}
                  disabled={isGeneratingScript}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white text-xs font-bold shadow-md shadow-rose-600/20 transition-all cursor-pointer"
                >
                  {isGeneratingScript ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>DeepSeek-R1 Storyboarding...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      <span>Parse Plot to Page & Layout Panels</span>
                    </>
                  )}
                </button>
              </div>

              {/* Generated panel indicators preview */}
              <div className="space-y-2.5 pt-4 border-t border-slate-800/80">
                <span className="block text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                  Storyboard Panel Blueprint
                </span>
                <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                  {panels.map((p) => (
                    <div 
                      key={p.id}
                      onClick={() => handleSelectPanel(p.id)}
                      className={`flex items-center justify-between p-2 rounded-lg border text-xs cursor-pointer transition-colors ${
                        p.id === selectedPanelId 
                          ? 'bg-rose-500/10 border-rose-500/40 text-rose-300' 
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono bg-slate-800 text-slate-300 rounded px-1 text-[10px]">
                          P.{p.panelIndex}
                        </span>
                        <span className="truncate max-w-[150px]">{p.actionPrompt}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono capitalize">
                        {p.bubbleStyle} bubble
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: IMMUTABLE CHARACTER & LAYOUT VAULT */}
          {activeWorkflowStep === 2 && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-rose-400" />
                  <h3 className="font-bold text-slate-100 text-sm font-['Cinzel',serif]">
                    Step 2: Permanent Continuity Vault
                  </h3>
                </div>
                <span className="text-[10px] text-rose-400 font-mono font-bold bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                  Neon PostgreSQL
                </span>
              </div>

              {/* SMART SCRIPT CONTINUITY SCANNER */}
              <div className="bg-slate-950/85 border border-slate-800 rounded-2xl p-4 space-y-3 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-rose-500/40 to-transparent"></div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Cpu className="h-3.5 w-3.5 text-rose-400 animate-pulse" />
                    <span className="text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wider">
                      Smart Continuity Scan (Auto-Identifier)
                    </span>
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => {
                      setIsScanningScript(true);
                      setTimeout(() => {
                        setIsScanningScript(false);
                        setHasScanned(true);
                      }, 800);
                    }}
                    disabled={isScanningScript}
                    className="text-[9px] font-mono text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 px-2 py-1 rounded border border-rose-500/20 flex items-center gap-1 transition-all cursor-pointer"
                  >
                    <RefreshCw className={`h-2.5 w-2.5 ${isScanningScript ? 'animate-spin' : ''}`} />
                    <span>{isScanningScript ? 'Analyzing...' : 'Scan Script'}</span>
                  </button>
                </div>

                {isScanningScript ? (
                  <div className="py-6 flex flex-col items-center justify-center space-y-2 text-center">
                    <div className="relative h-8 w-8 flex items-center justify-center">
                      <RefreshCw className="h-5 w-5 text-rose-500 animate-spin" />
                    </div>
                    <p className="text-[10px] font-mono text-rose-300 animate-pulse">Scanning panel action prompts for characters & locations...</p>
                  </div>
                ) : hasScanned ? (
                  <div className="space-y-3 divide-y divide-slate-800/60">
                    
                    {/* Identified Characters Row */}
                    <div className="space-y-2">
                      <div className="text-[10px] font-mono text-slate-400 uppercase tracking-tight flex items-center justify-between">
                        <span>Detected Characters ({(Array.from(new Set(panels.flatMap(p => p.charactersPresent || []))) as string[]).length})</span>
                        <span className="text-[8px] text-slate-500">From Script Context</span>
                      </div>
                      
                      <div className="space-y-1.5 max-h-[110px] overflow-y-auto pr-1">
                        {(Array.from(new Set(panels.flatMap(p => p.charactersPresent || []))) as string[]).map((name: string) => {
                          const isMatched = characters.some(c => c.name.toLowerCase() === name.toLowerCase());
                          return (
                            <div key={name} className="flex items-center justify-between bg-slate-900/60 px-2.5 py-1.5 rounded-lg border border-slate-800/80 text-xs font-sans">
                              <div className="flex items-center gap-1.5">
                                <div className={`h-1.5 w-1.5 rounded-full ${isMatched ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`}></div>
                                <span className="font-bold text-slate-200">{name}</span>
                              </div>
                              
                              <div className="flex items-center gap-2 font-mono">
                                <span className={`text-[8px] px-1.5 py-0.5 rounded ${
                                  isMatched 
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                }`}>
                                  {isMatched ? 'Vault Active' : 'Missing Turnaround'}
                                </span>
                                
                                {!isMatched && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setMangaCharName(name);
                                      setMangaCharDescriptor(getCharacterAutofillDescriptor(name));
                                      setCharacterBuilderMode('custom');
                                      setStep2Tab('characters');
                                      setAutofillSuccessMessage(`Autofilled parameters for "${name}" turnaround!`);
                                      setTimeout(() => setAutofillSuccessMessage(null), 3000);
                                    }}
                                    className="text-[9px] bg-rose-600 hover:bg-rose-500 text-white px-2 py-0.5 rounded cursor-pointer transition-colors font-bold"
                                  >
                                    Autofill
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Identified Layout Backgrounds Row */}
                    <div className="space-y-2 pt-2.5">
                      <div className="text-[10px] font-mono text-slate-400 uppercase tracking-tight flex items-center justify-between">
                        <span>Detected Backdrop Layouts ({extractEnvironmentsFromScript().length})</span>
                        <span className="text-[8px] text-slate-500">Spatial Coordinates</span>
                      </div>
                      
                      <div className="space-y-1.5 max-h-[110px] overflow-y-auto pr-1">
                        {extractEnvironmentsFromScript().map(loc => {
                          const isMatched = environments.some(e => e.location_name.toLowerCase().includes(loc.toLowerCase()) || loc.toLowerCase().includes(e.location_name.toLowerCase()));
                          return (
                            <div key={loc} className="flex items-center justify-between bg-slate-900/60 px-2.5 py-1.5 rounded-lg border border-slate-800/80 text-xs font-sans">
                              <div className="flex items-center gap-1.5">
                                <div className={`h-1.5 w-1.5 rounded-full ${isMatched ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`}></div>
                                <span className="font-medium text-slate-300 truncate max-w-[120px]">{loc}</span>
                              </div>
                              
                              <div className="flex items-center gap-2 font-mono">
                                <span className={`text-[8px] px-1.5 py-0.5 rounded ${
                                  isMatched 
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                }`}>
                                  {isMatched ? 'Vault Active' : 'Missing Stage'}
                                </span>
                                
                                {!isMatched && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setMangaEnvLocation(loc);
                                      setMangaEnvStyle(getEnvironmentAutofillStyle(loc));
                                      setStep2Tab('environments');
                                      setAutofillSuccessMessage(`Autofilled parameters for layout: "${loc}"!`);
                                      setTimeout(() => setAutofillSuccessMessage(null), 3000);
                                    }}
                                    className="text-[9px] bg-rose-600 hover:bg-rose-500 text-white px-2 py-0.5 rounded cursor-pointer transition-colors font-bold"
                                  >
                                    Autofill
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                  </div>
                ) : (
                  <p className="text-[10px] font-mono text-slate-500 text-center py-2">Click Scan Script to auto-identify script assets.</p>
                )}

                {/* Autofill Toast Banner */}
                {autofillSuccessMessage && (
                  <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[10px] font-mono p-2 rounded-lg flex items-center gap-2 animate-pulse">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                    <span>{autofillSuccessMessage}</span>
                  </div>
                )}
              </div>

              {/* Sub tabs inside Step 2 */}
              <div className="flex border-b border-slate-800 gap-2">
                <button
                  type="button"
                  onClick={() => setStep2Tab('characters')}
                  className={`flex-1 pb-2 text-xs font-bold transition-all border-b-2 text-center cursor-pointer ${
                    step2Tab === 'characters'
                      ? 'border-rose-500 text-rose-400'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Character Turnarounds ({characters.length})
                </button>
                <button
                  type="button"
                  onClick={() => setStep2Tab('environments')}
                  className={`flex-1 pb-2 text-xs font-bold transition-all border-b-2 text-center cursor-pointer ${
                    step2Tab === 'environments'
                      ? 'border-rose-500 text-rose-400'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Layout Backgrounds ({environments.length})
                </button>
              </div>

              {step2Tab === 'characters' && (
                <div className="space-y-4 animate-fadeIn">
                  {/* AI Consistency Shield & Reference Auto-Enhancer Banner */}
                  {(() => {
                    const insufficientCount = characters.filter(isCharReferenceInsufficient).length;
                    const readyCount = characters.length - insufficientCount;
                    return (
                      <div className="p-3 bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border border-slate-800 rounded-xl space-y-2.5">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-2">
                            {insufficientCount > 0 ? (
                              <ShieldAlert className="h-4 w-4 text-amber-400 shrink-0 animate-pulse" />
                            ) : (
                              <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                            )}
                            <div>
                              <span className="block text-xs font-bold text-slate-200">
                                AI Consistency Shield
                              </span>
                              <span className="text-[10px] font-mono text-slate-400">
                                {insufficientCount > 0 
                                  ? `${insufficientCount} placeholder reference(s) need auto-enhancement` 
                                  : `All ${characters.length} characters locked with 4-angle model sheets`}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <label className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400 cursor-pointer bg-slate-950 px-2 py-1 rounded border border-slate-800">
                              <input
                                type="checkbox"
                                checked={isAutoEnhanceEnabled}
                                onChange={(e) => setIsAutoEnhanceEnabled(e.target.checked)}
                                className="rounded text-rose-500 focus:ring-0 bg-slate-900 border-slate-700"
                              />
                              <span>Auto-Upgrade on Render</span>
                            </label>

                            {insufficientCount > 0 && (
                              <button
                                type="button"
                                onClick={handleBatchAutoEnhanceAll}
                                disabled={isBatchEnhancing}
                                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 text-white text-[10px] font-bold shadow-sm transition-all cursor-pointer"
                              >
                                {isBatchEnhancing ? (
                                  <>
                                    <RefreshCw className="h-3 w-3 animate-spin" />
                                    <span>Enhancing All...</span>
                                  </>
                                ) : (
                                  <>
                                    <Wand2 className="h-3 w-3" />
                                    <span>Auto-Enhance All ({insufficientCount})</span>
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                        </div>

                        {enhanceProgressMsg && (
                          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 text-[10px] font-mono p-2 rounded-lg flex items-center gap-2">
                            <Sparkles className="h-3.5 w-3.5 text-rose-400 shrink-0 animate-spin" />
                            <span>{enhanceProgressMsg}</span>
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Style-invariant multi-angle turnaround sheets are stored securely on Hostinger VPS and cached in your Neon DB. Use these as anchors to generate perfect panel frames.
                  </p>

                  {/* Character Generation Form */}
                  <div className="p-3.5 bg-slate-950/90 border border-slate-800 rounded-xl space-y-3.5">
                    <span className="block text-[10px] font-mono font-bold text-rose-400 uppercase tracking-wider">
                      + Character Generator (Smart Vault Builder)
                    </span>

                    {/* Mode Selector Tabs */}
                    <div className="flex bg-slate-900/80 p-0.5 rounded-lg border border-slate-800/80 text-[10px] font-mono">
                      <button
                        type="button"
                        onClick={() => setCharacterBuilderMode('guided')}
                        className={`flex-1 py-1 px-1.5 rounded-md font-bold transition-all ${characterBuilderMode === 'guided' ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30' : 'text-slate-400 hover:text-slate-200'}`}
                      >
                        Smart Guided Form
                      </button>
                      <button
                        type="button"
                        onClick={() => setCharacterBuilderMode('custom')}
                        className={`flex-1 py-1 px-1.5 rounded-md font-bold transition-all ${characterBuilderMode === 'custom' ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30' : 'text-slate-400 hover:text-slate-200'}`}
                      >
                        Freeform Prompt
                      </button>
                    </div>

                    <form onSubmit={handleGenerateMangaCharacter} className="space-y-3">
                      {/* Common: Character Name */}
                      <div className="space-y-1">
                        <label className="block text-[10px] font-mono text-slate-400">Character Name</label>
                        <input
                          type="text"
                          placeholder="e.g. Kenji, Saito, Kaelen"
                          value={mangaCharName}
                          onChange={(e) => setMangaCharName(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-rose-500"
                          required
                        />
                      </div>

                      {characterBuilderMode === 'guided' ? (
                        <div className="space-y-3 pt-1 border-t border-slate-900">
                          {/* Demographic / Age Category */}
                          <div className="space-y-1">
                            <label className="block text-[10px] font-mono text-slate-400">Gender & Age Group</label>
                            <select
                              value={charDemographic}
                              onChange={(e) => setCharDemographic(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-rose-500 cursor-pointer"
                            >
                              <option value="Adult 28-year-old male with an athletic, well-built physique">Adult Male (20-30s)</option>
                              <option value="Adult 26-year-old female with soft refined features and an elegant posture">Adult Female (20-30s)</option>
                              <option value="Slender 16-year-old adolescent boy with an active, agile build">Teen Boy (Adolescent)</option>
                              <option value="Slender 16-year-old adolescent girl with a youthful, energetic build">Teen Girl (Adolescent)</option>
                              <option value="Youthful 10-year-old child boy with rounded cheeks, large expressive eyes, and natural proportions">Young Boy (Child, 10yo)</option>
                              <option value="Youthful 10-year-old child girl with rounded cheeks, large expressive eyes, and natural proportions">Young Girl (Child, 10yo)</option>
                              <option value="Wise elderly 68-year-old grandfather patriarch with weathered, dignified posture">Elderly Patriarch (Elder)</option>
                              <option value="Wise elderly 68-year-old grandmother matriarch with weathered, dignified posture">Elderly Matriarch (Elder)</option>
                              <option value="custom">✍️ Custom Age & Gender...</option>
                            </select>
                            {charDemographic === 'custom' && (
                              <input
                                type="text"
                                placeholder="e.g. Robust 45-year-old cyber-warlord with massive build"
                                value={charDemographicCustom}
                                onChange={(e) => setCharDemographicCustom(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 mt-1 focus:outline-none focus:border-rose-500"
                                required
                              />
                            )}
                          </div>

                          {/* Hairstyle */}
                          <div className="space-y-1">
                            <label className="block text-[10px] font-mono text-slate-400">Hairstyle & Color</label>
                            <select
                              value={charHair}
                              onChange={(e) => setCharHair(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-rose-500 cursor-pointer"
                            >
                              <option value="Traditional samurai topknot (chonmage) with loose wind-blown side bangs">Samurai Topknot (Chonmage)</option>
                              <option value="Messy wind-blown dark raven-black ronin hair">Messy Ronin Hair</option>
                              <option value="Flowing silken silver-white hair tied back neatly with a simple cord">Flowing Silver-White Hair</option>
                              <option value="Tousled layered spiky cyberpunk crop with neon blue specular highlights">Tousled Cyberpunk Crop</option>
                              <option value="Long obsidian-black hair in a traditional braided hime-cut with straight bangs">Braided Hime-cut</option>
                              <option value="Short layered textured pixie cut framing the face neatly">Short Pixie Cut</option>
                              <option value="Clean textured modern crop with dark parted bangs">Classic Detective Crop</option>
                              <option value="custom">✍️ Custom Hairstyle...</option>
                            </select>
                            {charHair === 'custom' && (
                              <input
                                type="text"
                                placeholder="e.g. Messy long blonde ponytail with two loose strands framing the eyes"
                                value={charHairCustom}
                                onChange={(e) => setCharHairCustom(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 mt-1 focus:outline-none focus:border-rose-500"
                                required
                              />
                            )}
                          </div>

                          {/* Eyes & Expression */}
                          <div className="space-y-1">
                            <label className="block text-[10px] font-mono text-slate-400">Eyes & Facial Expression</label>
                            <select
                              value={charEyes}
                              onChange={(e) => setCharEyes(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-rose-500 cursor-pointer"
                            >
                              <option value="Narrowed, piercing dark eyes with intense battle-hardened stoic focus">Narrowed Stoic Gaze (Battle-hardened)</option>
                              <option value="Wide, expressive, and bright dark eyes full of youthful innocence and curiosity">Wide Innocent Eyes (Expressive child/teen)</option>
                              <option value="Calm, deep-set reflective eyes with gentle wisdom lines">Wise Reflective Look (Stern but kind)</option>
                              <option value="Luminous crystal-azure eyes with commanding, noble determination">Regal Crystal-Azure (Commanding)</option>
                              <option value="Glowing cobalt cybernetic ocular lens with active scanning HUD overlay">Glowing Cybernetic Ocular Lens</option>
                              <option value="Elegant clear almond-shaped eyes with a serene and observant gaze">Serene Almond-shaped Eyes</option>
                              <option value="custom">✍️ Custom Expression...</option>
                            </select>
                            {charEyes === 'custom' && (
                              <input
                                type="text"
                                placeholder="e.g. Sharp golden eyes with a wild, cheeky, mischievous grin"
                                value={charEyesCustom}
                                onChange={(e) => setCharEyesCustom(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 mt-1 focus:outline-none focus:border-rose-500"
                                required
                              />
                            )}
                          </div>

                          {/* Facial Architecture & Accents */}
                          <div className="space-y-1">
                            <label className="block text-[10px] font-mono text-slate-400">Facial Architecture & Features</label>
                            <select
                              value={charFace}
                              onChange={(e) => setCharFace(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-rose-500 cursor-pointer"
                            >
                              <option value="Rugged chiseled jawline, stoic expression, and a subtle horizontal scar across the left brow">Chiseled Jawline with Brow Scar</option>
                              <option value="Smooth clear skin, round cheeks, and an innocent, earnest expression">Smooth Clear Childlike Face (No Ruggedness)</option>
                              <option value="Dignified facial structure with refined age lines and a calm, wise countenance">Dignified Weathered Age Lines</option>
                              <option value="Sharp angular jawline with subtle cybernetic neural ports along the temple">Sharp Angular with Cyber Ports</option>
                              <option value="Elegant soft refined jawline with prominent high cheekbones and a serene expression">Elegant Soft Refined (High Cheekbones)</option>
                              <option value="Gritty chiseled jawline with a subtle dark stubble shadow and calm disciplined eyes">Gritty Dark Stubble Shadow</option>
                              <option value="custom">✍️ Custom Features...</option>
                            </select>
                            {charFace === 'custom' && (
                              <input
                                type="text"
                                placeholder="e.g. Smooth oval face with high cheekbones and small beauty mark under right eye"
                                value={charFaceCustom}
                                onChange={(e) => setCharFaceCustom(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 mt-1 focus:outline-none focus:border-rose-500"
                                required
                              />
                            )}
                          </div>

                          {/* Signature Attire & Wardrobe */}
                          <div className="space-y-1">
                            <label className="block text-[10px] font-mono text-slate-400">Signature Attire & Wardrobe</label>
                            <select
                              value={charAttire}
                              onChange={(e) => setCharAttire(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-rose-500 cursor-pointer"
                            >
                              <option value="smart-auto">🤖 Smart Auto-style (Follow Lore/Setting)</option>
                              <option value="Battle-worn dark indigo and charcoal samurai haori over iron lamellar armor plates, tailored hakama trousers">Battle-worn Samurai Haori & Armor</option>
                              <option value="Elegant layered dark indigo linen kimono tied with a crisp cream-colored obi sash">Elegant Layered Indigo Kimono</option>
                              <option value="Etched runic silver-mythril full-plate armor with azure velvet mantle and reinforced chainmail">Runic Silver-Mythril Plate Armor</option>
                              <option value="Sleek high-neck carbon-fiber tactical cyberpunk jumpsuit with neon violet detailing">High-neck Carbon Jumpsuit (Cyberpunk)</option>
                              <option value="Heavy dark charcoal overcoat over a black tactical turtleneck and tailored combat trousers">Heavy Charcoal Overcoat & Turtleneck</option>
                              <option value="custom">✍️ Custom Attire/Armor...</option>
                            </select>
                            {charAttire === 'custom' && (
                              <input
                                type="text"
                                placeholder="e.g. Traditional white priestess shrine robes (Miko outfit) covering full body"
                                value={charAttireCustom}
                                onChange={(e) => setCharAttireCustom(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 mt-1 focus:outline-none focus:border-rose-500"
                                required
                              />
                            )}
                            <p className="text-[9px] text-slate-500 italic mt-0.5">
                              {charAttire === 'smart-auto' 
                                ? "✨ Smart identification will auto-inject period-accurate attire using the active manga's genre context." 
                                : "Enforces absolute outfit continuity across panels."}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <label className="block text-[10px] font-mono text-slate-400">Visual Descriptor (Freeform Prompt)</label>
                          <textarea
                            rows={3}
                            placeholder="Visual details (robes, face, hair, setting)..."
                            value={mangaCharDescriptor}
                            onChange={(e) => setMangaCharDescriptor(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-rose-500 font-sans leading-relaxed"
                            required
                          />
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={isGeneratingMangaChar}
                        className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-bold transition-all cursor-pointer shadow-md shadow-rose-600/10"
                      >
                        {isGeneratingMangaChar ? (
                          <>
                            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                            <span>Forging Vault Turnaround...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-3.5 w-3.5" />
                            <span>Lock Turnaround to Vault (Qwen-2 Pro)</span>
                          </>
                        )}
                      </button>
                    </form>
                  </div>

                  {/* Character List Grid */}
                  <div className="grid grid-cols-2 gap-2.5 max-h-[300px] overflow-y-auto pr-1">
                    {characters.length === 0 ? (
                      <div className="col-span-2 text-center py-6 text-slate-500 text-xs font-mono">
                        No characters generated yet. Let's create one!
                      </div>
                    ) : (
                      characters.map((char) => {
                        const isInActivePanel = (activePanel.charactersPresent || []).some(
                          c => c.toLowerCase() === char.name.toLowerCase()
                        );
                        const isInsufficient = isCharReferenceInsufficient(char);
                        const isThisEnhancing = enhancingCharId === char.id;

                        return (
                          <div 
                            key={char.id}
                            className={`p-2.5 bg-slate-950/80 border rounded-xl space-y-2 transition-all ${
                              isInActivePanel 
                                ? 'border-rose-500 shadow-md shadow-rose-500/10' 
                                : 'border-slate-800 hover:border-slate-700'
                            }`}
                          >
                            <div className="relative">
                              <img 
                                src={char.turnaround_url || char.reference_images[0]} 
                                alt={char.name}
                                className="w-full h-24 object-cover rounded-lg border border-slate-800 grayscale"
                                referrerPolicy="no-referrer"
                              />
                              {isInsufficient ? (
                                <span className="absolute top-1 right-1 text-[7px] font-mono font-bold bg-amber-500/90 text-black px-1.5 py-0.5 rounded shadow">
                                  Placeholder
                                </span>
                              ) : (
                                <span className="absolute top-1 right-1 text-[7px] font-mono font-bold bg-emerald-500/90 text-white px-1.5 py-0.5 rounded shadow flex items-center gap-0.5">
                                  <ShieldCheck className="h-2 w-2" />
                                  Turnaround Locked
                                </span>
                              )}
                            </div>
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between gap-1">
                                <span className="block text-xs font-bold text-slate-200 truncate">{char.name}</span>
                                <span className="text-[8px] font-mono text-rose-400 block tracking-tight uppercase">Turnaround</span>
                              </div>

                              {isInsufficient && (
                                <button
                                  type="button"
                                  onClick={() => handleAutoEnhanceCharacter(char)}
                                  disabled={isThisEnhancing}
                                  className="w-full py-1 px-1.5 rounded text-[8px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 transition-all flex items-center justify-center gap-1 cursor-pointer"
                                >
                                  {isThisEnhancing ? (
                                    <>
                                      <RefreshCw className="h-2.5 w-2.5 animate-spin" />
                                      <span>Synthesizing...</span>
                                    </>
                                  ) : (
                                    <>
                                      <Wand2 className="h-2.5 w-2.5" />
                                      <span>Auto-Enhance Turnaround</span>
                                    </>
                                  )}
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => handleToggleCharacterInPanel(char.name)}
                                className={`w-full py-1 px-1.5 rounded text-[9px] font-mono font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                                  isInActivePanel
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                                    : 'bg-slate-800/90 text-slate-300 border border-slate-700 hover:bg-rose-600 hover:text-white hover:border-rose-500'
                                }`}
                              >
                                {isInActivePanel ? (
                                  <>
                                    <Check className="h-2.5 w-2.5" />
                                    <span>In Panel {activePanel.panelIndex}</span>
                                  </>
                                ) : (
                                  <>
                                    <Plus className="h-2.5 w-2.5" />
                                    <span>Add to Panel {activePanel.panelIndex}</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

              {step2Tab === 'environments' && (
                <div className="space-y-4 animate-fadeIn">
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Generate highly detailed empty stage layouts to define the spatial scene coordinates for your storyboard frames.
                  </p>

                  {/* Background Generation Form */}
                  <form onSubmit={handleGenerateMangaEnvironment} className="p-3.5 bg-slate-950/90 border border-slate-800 rounded-xl space-y-3">
                    <span className="block text-[10px] font-mono font-bold text-rose-400 uppercase tracking-wider">
                      + Generate Manga Layout Background
                    </span>
                    <div className="space-y-2">
                      <input
                        type="text"
                        placeholder="Location Name (e.g. Neon Citadel Roof, Cyber Dojo)"
                        value={mangaEnvLocation}
                        onChange={(e) => setMangaEnvLocation(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-rose-500"
                        required
                      />
                      <textarea
                        rows={2}
                        placeholder="Style descriptor (buildings, wires, light angles)..."
                        value={mangaEnvStyle}
                        onChange={(e) => setMangaEnvStyle(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-rose-500"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isGeneratingMangaEnv}
                      className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-bold transition-all cursor-pointer"
                    >
                      {isGeneratingMangaEnv ? (
                        <>
                          <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                          <span>Generating Background Layout...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-3.5 w-3.5" />
                          <span>Generate Layout (Qwen-2 Pro)</span>
                        </>
                      )}
                    </button>
                  </form>

                  {/* Background List Grid */}
                  <div className="grid grid-cols-2 gap-2.5 max-h-[220px] overflow-y-auto pr-1">
                    {environments.length === 0 ? (
                      <div className="col-span-2 text-center py-6 text-slate-500 text-xs font-mono">
                        No background layouts generated yet. Create one!
                      </div>
                    ) : (
                      environments.map((env) => (
                        <div 
                          key={env.id}
                          className="p-2.5 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2 hover:border-rose-500/40 transition-colors"
                        >
                          <img 
                            src={env.master_keyframe_url} 
                            alt={env.location_name}
                            className="w-full h-24 object-cover rounded-lg border border-slate-800 grayscale"
                            referrerPolicy="no-referrer"
                          />
                          <div className="text-center">
                            <span className="block text-xs font-bold text-slate-200 truncate">{env.location_name}</span>
                            <span className="text-[8px] font-mono text-rose-400 block tracking-tight">BACKGROUND STAGE</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
                <div>
                  <span className="block text-xs font-bold text-slate-200">Active Panel Links:</span>
                  <div className="text-[10px] font-mono text-rose-300 flex flex-col gap-0.5 mt-0.5">
                    <span>Char: {activePanel.charSheetUrl.substring(0, 35)}...</span>
                    <span>Bg: {activePanel.bgUrl.substring(0, 35)}...</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 text-[9px] font-mono rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase font-bold shrink-0">
                  Ready
                </span>
              </div>

              <button
                onClick={() => setActiveWorkflowStep(3)}
                className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-colors cursor-pointer"
              >
                <span>Proceed to Composition (Step 3)</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* STEP 3: SILICONFLOW QWEN COMPOSITION */}
          {activeWorkflowStep === 3 && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-rose-400" />
                  <h3 className="font-bold text-slate-100 text-sm font-['Cinzel',serif]">
                    Step 3: Qwen Panel Composition
                  </h3>
                </div>
                <span className="text-[10px] text-rose-400 font-mono font-bold bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                  Qwen-Image-Edit
                </span>
              </div>

              <div className="space-y-4">
                <p className="text-xs text-slate-300 leading-relaxed">
                  Sends the pre-saved background layout and the immutable character turnaround sheet to the <span className="text-rose-300 font-bold">AI Manga Studio Engine</span>. The engine incorporates the character perfectly while safeguarding facial features and room aesthetics.
                </p>

                {/* Dynamic Configuration form */}
                <div className="space-y-3.5">
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                      Panel Instruction Prompt
                    </label>
                    <textarea
                      rows={3}
                      value={activePanel.actionPrompt}
                      onChange={(e) => handleUpdatePanel(activePanel.id, { actionPrompt: e.target.value })}
                      onBlur={() => handleAutoDetectCharacters()}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:border-rose-500 font-sans"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                      Facial Expression Anchor
                    </label>
                    <input
                      type="text"
                      value={activePanel.expression}
                      onChange={(e) => handleUpdatePanel(activePanel.id, { expression: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-rose-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                      Equipment & Clothing Anchor
                    </label>
                    <input
                      type="text"
                      value={activePanel.equipment || ''}
                      onChange={(e) => handleUpdatePanel(activePanel.id, { equipment: e.target.value })}
                      placeholder="e.g. Glowing neon visor, heavy mech suit..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-rose-500"
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="block text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                        Characters in Scene (Multi-Character Support)
                      </span>
                      <button
                        type="button"
                        onClick={handleAutoDetectCharacters}
                        className="text-[10px] font-mono text-rose-400 hover:text-rose-300 flex items-center gap-1 bg-rose-500/10 hover:bg-rose-500/20 px-2 py-0.5 rounded border border-rose-500/20 transition-all cursor-pointer"
                      >
                        <Sparkles className="h-3 w-3" />
                        <span>Auto-Detect from Prompt</span>
                      </button>
                    </div>

                    {/* Interactive Character Select Chips */}
                    <div className="space-y-1.5">
                      <label className="block text-[10px] text-slate-500 font-mono">Select characters present in this frame:</label>
                      <div className="flex flex-wrap gap-1.5">
                        {characters.map((char) => {
                          const isSelected = (activePanel.charactersPresent || []).some(
                            c => c.toLowerCase() === char.name.toLowerCase()
                          );
                          return (
                            <button
                              key={char.id}
                              type="button"
                              onClick={() => handleToggleCharacterInPanel(char.name)}
                              className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 border transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-rose-600/30 border-rose-500 text-rose-200 shadow-sm shadow-rose-500/20'
                                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300'
                              }`}
                            >
                              {isSelected ? <Check className="h-3 w-3 text-rose-400" /> : <Plus className="h-3 w-3 text-slate-500" />}
                              <span>{char.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Detailed Active Character Reference List */}
                    <div className="space-y-2">
                      {(!activePanel.charactersPresent || activePanel.charactersPresent.length === 0) ? (
                        <div className="p-3 bg-slate-950/70 border border-dashed border-slate-800 rounded-xl text-center text-xs text-slate-500 font-mono">
                          No characters tagged in this panel yet. Click character chips above or use Auto-Detect.
                        </div>
                      ) : (
                        <div className="space-y-1.5">
                          {activePanel.charactersPresent.map((charName) => {
                            const matched = characters.find(c => c.name.toLowerCase() === charName.toLowerCase());
                            const refImg = matched?.turnaround_url || matched?.reference_images?.[0];
                            return (
                              <div
                                key={charName}
                                className="p-2 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between gap-2.5"
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  {refImg ? (
                                    <img
                                      src={refImg}
                                      alt={charName}
                                      className="w-10 h-10 object-cover rounded-lg border border-slate-800 grayscale shrink-0"
                                      referrerPolicy="no-referrer"
                                    />
                                  ) : (
                                    <div className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0 text-slate-500 text-[10px] font-mono">
                                      {charName.slice(0, 2).toUpperCase()}
                                    </div>
                                  )}
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-xs font-bold text-slate-200 truncate">{charName}</span>
                                      {refImg ? (
                                        <span className="text-[8px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.2 rounded">
                                          Turnaround Synced
                                        </span>
                                      ) : (
                                        <span className="text-[8px] font-mono bg-amber-500/20 text-amber-400 border border-amber-500/30 px-1.5 py-0.2 rounded">
                                          No Turnaround
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-[10px] text-slate-400 truncate max-w-[200px]">
                                      {matched?.visual_descriptor || 'Custom character descriptor'}
                                    </p>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleToggleCharacterInPanel(charName)}
                                  className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-900 transition-colors cursor-pointer"
                                  title="Remove character from panel"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Pre-Flight Consistency Status Banner in Step 3 */}
                    {(() => {
                      const taggedChars = (activePanel.charactersPresent || []).map(name => 
                        characters.find(c => c.name.toLowerCase() === name.toLowerCase())
                      ).filter(Boolean) as Character[];

                      const insufficientTagged = taggedChars.filter(isCharReferenceInsufficient);

                      if (insufficientTagged.length > 0) {
                        return (
                          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl space-y-2">
                            <div className="flex items-start gap-2">
                              <ShieldAlert className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                              <div className="space-y-1">
                                <span className="block text-xs font-bold text-amber-300">
                                  Auto-Enhancer Active for This Scene
                                </span>
                                <p className="text-[10px] text-amber-200/80 leading-tight font-mono">
                                  {insufficientTagged.map(c => c.name).join(', ')} currently have placeholder references. {isAutoEnhanceEnabled ? "The auto-enhancer will generate a 4-angle turnaround sheet automatically upon rendering." : "Enable Auto-Upgrade to synthesize turnaround sheets before rendering."}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center justify-between gap-2 pt-1 border-t border-amber-500/20">
                              <label className="flex items-center gap-1.5 text-[9px] font-mono text-amber-300 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={isAutoEnhanceEnabled}
                                  onChange={(e) => setIsAutoEnhanceEnabled(e.target.checked)}
                                  className="rounded text-amber-500 focus:ring-0 bg-slate-900 border-amber-500/40"
                                />
                                <span>Auto-enhance before render</span>
                              </label>

                              {insufficientTagged.map(c => (
                                <button
                                  key={c.id}
                                  type="button"
                                  onClick={() => handleAutoEnhanceCharacter(c)}
                                  disabled={enhancingCharId === c.id}
                                  className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 transition-all flex items-center gap-1 cursor-pointer"
                                >
                                  {enhancingCharId === c.id ? (
                                    <>
                                      <RefreshCw className="h-2.5 w-2.5 animate-spin" />
                                      <span>Enhancing...</span>
                                    </>
                                  ) : (
                                    <>
                                      <Wand2 className="h-2.5 w-2.5" />
                                      <span>Enhance {c.name}</span>
                                    </>
                                  )}
                                </button>
                              ))}
                            </div>
                          </div>
                        );
                      } else if (taggedChars.length > 0) {
                        return (
                          <div className="space-y-2">
                            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-2">
                              <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                              <span className="text-[10px] font-mono text-emerald-300">
                                All {taggedChars.length} tagged character{taggedChars.length > 1 ? 's are' : ' is'} turnaround locked. Ready for consistent rendering!
                              </span>
                            </div>
                            {taggedChars.length >= 2 && (
                              <div className="p-2.5 bg-cyan-500/10 border border-cyan-500/30 rounded-xl space-y-1 font-mono">
                                <div className="flex items-center gap-1.5 text-cyan-300 font-bold text-[11px]">
                                  <Users className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                                  <span>Multi-Character Rendering Notice ({taggedChars.length} Focal Characters)</span>
                                </div>
                                <p className="text-[9px] text-cyan-200/80 leading-relaxed">
                                  Spatial stage anchoring ([LEFT STAGE], [RIGHT STAGE]) is active. Note: Multi-character interactions require precise spatial alignment; <strong>1 render attempt may not always be enough</strong> to isolate all poses perfectly. If character features blend, click <strong>Re-render Panel</strong> or adjust camera angle.
                                </p>
                              </div>
                            )}
                          </div>
                        );
                      }
                      return null;
                    })()}

                    {/* Layout template & Background Stage */}
                    <div className="space-y-2 pt-2 border-t border-slate-800/80">
                      {/* Manual Layout Template Selection */}
                      <div className="space-y-1.5">
                        <label className="block text-[10px] text-slate-500 uppercase font-bold tracking-tighter">Quick Layout Override:</label>
                        <div className="grid grid-cols-4 gap-1">
                          {[
                            { label: 'Full', class: 'col-span-12 row-span-2 h-80' },
                            { label: 'Half', class: 'col-span-6 row-span-1 h-64' },
                            { label: 'Splash', class: 'col-span-12 row-span-4 h-[600px]' },
                            { label: 'Square', class: 'col-span-4 row-span-1 h-48' }
                          ].map((tpl) => (
                            <button
                              key={tpl.label}
                              type="button"
                              onClick={() => handleUpdatePanel(activePanel.id, { layoutClass: tpl.class })}
                              className={`text-[9px] py-1 border rounded transition-all cursor-pointer ${
                                activePanel.layoutClass === tpl.class 
                                  ? 'bg-rose-500/20 border-rose-500 text-rose-300' 
                                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                              }`}
                            >
                              {tpl.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Background selection */}
                      <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
                        <label className="block text-[10px] text-slate-400 font-mono uppercase font-bold">Background Layout Stage:</label>
                        <div className="flex items-center gap-2">
                          <select
                            value={activePanel.bgUrl}
                            onChange={(e) => handleUpdatePanel(activePanel.id, { bgUrl: e.target.value })}
                            className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-rose-500 cursor-pointer"
                          >
                            <option value="https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=1200">Default Server Core (Demo Stage)</option>
                            {environments.map(env => (
                              <option key={env.id} value={env.master_keyframe_url}>{env.location_name}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleCopyPayload}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
                  >
                    {copiedPayload ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                    <span>{copiedPayload ? 'Copied' : 'Copy API JSON'}</span>
                  </button>

                  <button
                    onClick={handleRenderPanelWithQwen}
                    disabled={isRenderingPanel}
                    className="flex-[2] flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white text-xs font-bold shadow-md shadow-rose-600/20 transition-all cursor-pointer"
                  >
                    {isRenderingPanel ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span>Rendering Panel...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="h-4 w-4" />
                        <span>Render Panel {activePanel.panelIndex}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: SPEECH BUBBLE OVERLAY */}
          {activeWorkflowStep === 4 && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-rose-400" />
                  <h3 className="font-bold text-slate-100 text-sm font-['Cinzel',serif]">
                    Step 4: Pillow Dialogue Bubble Engine
                  </h3>
                </div>
                <span className="text-[10px] text-rose-400 font-mono font-bold bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                  Local Python PIL
                </span>
              </div>

              <div className="space-y-4">
                <p className="text-xs text-slate-300 leading-relaxed">
                  Avoids AI text hallucination entirely by overlaying crisp dialogue bubbles locally using Pillow directly on your Hostinger VPS server.
                </p>

                <div className="space-y-3 pt-2">
                  
                  {/* Bubble Dialogue string */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-300">
                      Speech Bubble Dialogue Text
                    </label>
                    <input
                      type="text"
                      value={activePanel.speechText}
                      onChange={(e) => handleUpdatePanel(activePanel.id, { speechText: e.target.value })}
                      onBlur={() => handleAutoDetectCharacters()}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-rose-500 font-sans"
                    />
                  </div>

                  {/* Bubble shape style */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-300">
                      Speech Bubble Graphic Shape
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { id: 'oval', label: 'Classic' },
                        { id: 'burst', label: 'Action' },
                        { id: 'thought', label: 'Thought' },
                        { id: 'whisper', label: 'Whisper' }
                      ].map((style) => (
                        <button
                          key={style.id}
                          onClick={() => handleUpdatePanel(activePanel.id, { bubbleStyle: style.id as any })}
                          className={`py-1.5 text-[10px] font-mono rounded-lg border text-center transition-all cursor-pointer ${
                            activePanel.bubbleStyle === style.id
                              ? 'bg-rose-500/20 border-rose-500/50 text-rose-300'
                              : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {style.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Positioning sliders */}
                  <div className="space-y-2 pt-1 font-mono text-[11px] text-slate-300">
                    <div className="flex items-center justify-between">
                      <span>Bubble X Coordinate:</span>
                      <span className="font-bold text-rose-400">{activePanel.bubbleX}%</span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="95"
                      value={activePanel.bubbleX}
                      onChange={(e) => handleUpdatePanel(activePanel.id, { bubbleX: parseInt(e.target.value) })}
                      className="w-full accent-rose-500"
                    />

                    <div className="flex items-center justify-between pt-2">
                      <span>Bubble Y Coordinate:</span>
                      <span className="font-bold text-rose-400">{activePanel.bubbleY}%</span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="95"
                      value={activePanel.bubbleY}
                      onChange={(e) => handleUpdatePanel(activePanel.id, { bubbleY: parseInt(e.target.value) })}
                      className="w-full accent-rose-500"
                    />

                    <div className="flex items-center justify-between pt-2">
                      <span>Bubble Scaling Scale:</span>
                      <span className="font-bold text-rose-400">{activePanel.bubbleScale}x</span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="20"
                      step="1"
                      value={activePanel.bubbleScale * 10}
                      onChange={(e) => handleUpdatePanel(activePanel.id, { bubbleScale: parseInt(e.target.value) / 10 })}
                      className="w-full accent-rose-500"
                    />
                  </div>

                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[10px] font-mono text-slate-400 leading-normal">
                  <span className="text-rose-400 font-bold block mb-1">Local Pillow Canvas Anchor code:</span>
                  draw.ellipse([{activePanel.bubbleX * 4}, {activePanel.bubbleY * 4}, {(activePanel.bubbleX + 40) * 4}, {(activePanel.bubbleY + 25) * 4}], fill="white", outline="black")
                </div>
              </div>
            </div>
          )}

          {/* PYTHON ORCHESTRATION PAYLOAD EXPANSION CARD */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-2">
              <Code2 className="h-4 w-4 text-amber-400" />
              <h4 className="font-bold text-slate-100 text-xs font-['Cinzel',serif] tracking-tight">
                Manga Panel Generation worker code (manga_tasks.py)
              </h4>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Copy this production-grade Celery background worker task blueprint to deploy directly on your Hostinger VPS server environment.
            </p>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 max-h-[140px] overflow-y-auto font-mono text-[10px] text-amber-200/80 leading-relaxed">
              <pre>{`import os
import requests
from celery import Celery
from PIL import Image, ImageDraw, ImageFont

celery_app = Celery("manga_tasks", broker=os.getenv("RABBITMQ_URL"))

@celery_app.task
def generate_manga_panel(panel_prompt, char_sheet, bg_layout, speech_text, output_path):
    headers = {"Authorization": f"Bearer {os.getenv('SILICONFLOW_API_KEY')}"}
    # 1. Dispatch multi-reference payload
    payload = {
        "model": "Qwen/Qwen-Image-Edit",
        "prompt": f"Black and white manga illustration, Gekiga screentone. {panel_prompt}",
        "image": bg_layout,
        "reference_image": char_sheet,
        "num_inference_steps": 25
    }
    res = requests.post("https://api.siliconflow.cn/v1/image/edit", json=payload, headers=headers).json()
    img_data = requests.get(res['images'][0]['url']).content
    
    # 2. Vector Speech Bubble Overlay
    img = Image.open(BytesIO(img_data))
    draw = ImageDraw.Draw(img)
    draw.ellipse([50, 50, 350, 180], fill="white", outline="black", width=3)
    draw.text((80, 90), speech_text, fill="black")
    img.save(output_path)`}</pre>
            </div>
          </div>

          {mangaScope !== 'single_page' && activeWorkflowStep === 4 && (
            <div className="pt-6 pb-2 flex justify-end border-t border-slate-800/60 mt-4 animate-fadeIn">
              <button 
                onClick={handleNextPage}
                className="flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/20 transition-all active:scale-95 text-sm"
              >
                <span>Complete & Continue to Next Page</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}

        </div>

      </div>


      {/* CHAPTER HISTORY MODAL */}
      {showChapterPreview && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 sm:p-8 overflow-hidden backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-6xl h-full flex flex-col shadow-2xl relative overflow-hidden animate-fadeIn">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-900/80 z-10">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-400 border border-indigo-500/30">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white font-['Cinzel',serif]">Chapter {currentChapter} Gallery & History</h2>
                  <p className="text-xs text-slate-400">Review, preview, and download your assembled manga pages</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={handleExportChapterZip}
                  disabled={isExportingZip}
                  className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-indigo-500/20 transition-all cursor-pointer active:scale-95"
                >
                  {isExportingZip ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Layers className="h-4 w-4" />}
                  <span>Export Full Chapter (ZIP)</span>
                </button>
                <button 
                  onClick={() => setShowChapterPreview(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>

            {/* Modal Content - Pages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-12 bg-slate-950">
              {historyPages.map((hp) => (
                <div key={hp.id} className="flex flex-col items-center">
                  <div className="mb-4 flex items-center justify-between w-full max-w-3xl px-2">
                    <span className="text-xs font-mono font-bold text-indigo-300 bg-indigo-500/20 px-3 py-1 rounded-full border border-indigo-500/30">
                      Page {hp.pageNumber} • Chapter {hp.chapterNumber}
                    </span>
                    {hp.pageImageObj && (
                      <button
                        onClick={() => downloadDataUrl(hp.pageImageObj, `manga_c${hp.chapterNumber}_p${hp.pageNumber}.jpg`)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-300 text-xs font-bold rounded-lg border border-slate-700 transition-all cursor-pointer"
                      >
                        <Download className="h-3.5 w-3.5" />
                        <span>Download Page {hp.pageNumber}</span>
                      </button>
                    )}
                  </div>
                  <div className="relative group max-w-3xl w-full border-8 border-slate-900 rounded-xl overflow-hidden shadow-2xl bg-white">
                    {hp.pageImageObj ? (
                      <img src={hp.pageImageObj} alt={`Page ${hp.pageNumber}`} className="w-full h-auto" />
                    ) : (
                      <div className="w-full h-64 flex items-center justify-center bg-slate-900 text-slate-500">
                        Image capture failed for this page.
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SMART CHARACTER & ENVIRONMENT VAULT MODAL */}
      {isCharacterVaultOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 sm:p-8 overflow-hidden backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-5xl h-full flex flex-col shadow-2xl relative overflow-hidden animate-fadeIn">
            <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-900/80">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-amber-500/20 rounded-xl flex items-center justify-center text-amber-400 border border-amber-500/30">
                  <UserCheck className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white font-['Cinzel',serif]">Smart Character & Environment Vault</h2>
                  <p className="text-xs text-slate-400">Access and select saved character reference sheets and environment backgrounds across projects</p>
                </div>
              </div>
              <button 
                onClick={() => setIsCharacterVaultOpen(false)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Close Vault
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-slate-950">
              <div>
                <h3 className="text-sm font-bold text-amber-400 font-mono tracking-wider uppercase mb-4">Saved Characters ({characters.length})</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {characters.map(c => (
                    <div key={c.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between gap-3">
                      <div>
                        <div className="h-36 rounded-xl bg-slate-950 overflow-hidden mb-3 border border-slate-800 flex items-center justify-center">
                          {c.image_url ? (
                            <img src={c.image_url} alt={c.name} className="w-full h-full object-cover" />
                          ) : (
                            <UserCheck className="h-10 w-10 text-slate-700" />
                          )}
                        </div>
                        <h4 className="text-sm font-bold text-white">{c.name}</h4>
                        <p className="text-xs text-slate-400 mt-1 line-clamp-2">{c.description}</p>
                      </div>
                      <button 
                        onClick={() => {
                          setMangaCharName(c.name);
                          setMangaCharDescriptor(c.description);
                          setIsCharacterVaultOpen(false);
                        }}
                        className="w-full py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-bold transition-all"
                      >
                        Select into Project
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-emerald-400 font-mono tracking-wider uppercase mb-4">Saved Environments ({environments.length})</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {environments.map(e => (
                    <div key={e.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between gap-3">
                      <div>
                        <div className="h-36 rounded-xl bg-slate-950 overflow-hidden mb-3 border border-slate-800 flex items-center justify-center">
                          {e.image_url ? (
                            <img src={e.image_url} alt={e.name} className="w-full h-full object-cover" />
                          ) : (
                            <ImageIcon className="h-10 w-10 text-slate-700" />
                          )}
                        </div>
                        <h4 className="text-sm font-bold text-white">{e.name}</h4>
                        <p className="text-xs text-slate-400 mt-1 line-clamp-2">{e.description}</p>
                      </div>
                      <button 
                        onClick={() => {
                          setMangaEnvLocation(e.name);
                          setMangaEnvStyle(e.description);
                          setIsCharacterVaultOpen(false);
                        }}
                        className="w-full py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-bold transition-all"
                      >
                        Select into Project
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SMART PANEL STORAGE VAULT MODAL */}
      {isPanelVaultOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 sm:p-8 overflow-hidden backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-5xl h-full flex flex-col shadow-2xl relative overflow-hidden animate-fadeIn">
            <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-900/80">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400 border border-emerald-500/30">
                  <ImageIcon className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white font-['Cinzel',serif]">Smart Panel Storage Vault</h2>
                  <p className="text-xs text-slate-400">All generated manga panels across pages and chapters securely archived</p>
                </div>
              </div>
              <button 
                onClick={() => setIsPanelVaultOpen(false)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Close Vault
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-950">
              {panels.map((p, idx) => (
                <div key={p.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between gap-3">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        Panel {idx + 1}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">{p.bubbleStyle}</span>
                    </div>
                    <div className="h-40 rounded-xl bg-slate-950 overflow-hidden mb-3 border border-slate-800 flex items-center justify-center">
                      {p.imageUrl ? (
                        <img src={p.imageUrl} alt={`Panel ${idx + 1}`} className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-xs text-slate-600 font-mono">Not Rendered Yet</div>
                      )}
                    </div>
                    <p className="text-xs text-slate-300 line-clamp-3 italic">"{p.actionPrompt}"</p>
                  </div>
                  {p.imageUrl && (
                    <a 
                      href={p.imageUrl} 
                      download={`panel_${idx + 1}.png`} 
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold text-center transition-all flex items-center justify-center gap-1.5"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span>Download Panel</span>
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CHAPTERS, PAGES & STORIES GALLERY MODAL */}
      {isChaptersGalleryOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 sm:p-8 overflow-hidden backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-5xl h-full flex flex-col shadow-2xl relative overflow-hidden animate-fadeIn">
            <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-900/80">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-400 border border-indigo-500/30">
                  <Layers className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white font-['Cinzel',serif]">Chapters, Pages & Stories Gallery</h2>
                  <p className="text-xs text-slate-400">Access, save, edit, and switch between your chapters and story arcs at any time</p>
                </div>
              </div>
              <button 
                onClick={() => setIsChaptersGalleryOpen(false)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Close Gallery
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-950">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      Active Series: {activeSeries?.title || 'Untitled Series'}
                    </span>
                    <h3 className="text-lg font-bold text-white mt-3 font-['Cinzel',serif]">{activeEpisode?.title || 'Chapter 1: Genesis'}</h3>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                      Route: <span className="text-amber-300 font-mono">{activeEpisode?.route || 'MANGA_CHAPTER'}</span> • Scope: <span className="text-emerald-400 font-mono">{mangaScope}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => {
                        setShowChapterPreview(true);
                        setIsChaptersGalleryOpen(false);
                      }}
                      className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                    >
                      <BookOpen className="h-4 w-4" />
                      <span>View Chapter Pages ({historyPages.length})</span>
                    </button>
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      Chapter Management
                    </span>
                    <h3 className="text-lg font-bold text-white mt-3 font-['Cinzel',serif]">Chapter {currentChapter} Archival</h3>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                      Quickly export chapter canvases or jump between chapters.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => {
                        setCurrentChapter(c => c + 1);
                        setIsChaptersGalleryOpen(false);
                      }}
                      className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-all"
                    >
                      Create New Chapter ({currentChapter + 1})
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VERCEL CLOUD STORAGE & NEON DB SYNC HUB */}
      {isStorageHubOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 sm:p-8 overflow-hidden backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-5xl h-full flex flex-col shadow-2xl relative overflow-hidden animate-fadeIn">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-900/80">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-sky-500/20 rounded-xl flex items-center justify-center text-sky-400 border border-sky-500/30">
                  <Cloud className="h-5 w-5 animate-pulse" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white font-['Cinzel',serif]">Vercel Cloud Storage & Neon DB Sync Hub</h2>
                  <p className="text-xs text-slate-400">Manage user-isolated cloud assets, live DB queries, and Vercel Blob directories</p>
                </div>
              </div>
              <button 
                onClick={() => setIsStorageHubOpen(false)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Close Hub
              </button>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-950">
              
              {/* TOP LEVEL CLOUD STATE GRID */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Neon DB Metrics */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
                  <div>
                    <span className="text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Neon PostgreSQL State
                    </span>
                    <h4 className="text-sm font-bold text-white mt-2">Durable Relational Database</h4>
                    <p className="text-xs text-slate-400 mt-1">Multi-tenant row partition: <span className="text-amber-400 font-mono">usr_8829_alpha_neon</span></p>
                  </div>
                  <div className="mt-4 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/60 pt-3">
                    <span>Sync Status: <strong className="text-emerald-400">ACTIVE</strong></span>
                    <span>Tables: <strong className="text-white">8 Online</strong></span>
                  </div>
                </div>

                {/* Vercel Blob Cloud Container */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
                  <div>
                    <span className="text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
                      Vercel Blob Storage
                    </span>
                    <h4 className="text-sm font-bold text-white mt-2">Universal Asset Cloud</h4>
                    <p className="text-xs text-slate-400 mt-1">
                      Mode: <span className="text-sky-400 font-mono font-semibold">Isolated S3 Tenant</span>
                    </p>
                  </div>
                  <div className="mt-4 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/60 pt-3">
                    <span>Cloud Objects: <strong className="text-white">{storageFiles.length}</strong></span>
                    <span>Total Weight: <strong className="text-white">{(storageFiles.reduce((sum, f) => sum + f.size, 0) / (1024 * 1024)).toFixed(2)} MB</strong></span>
                  </div>
                </div>

                {/* Global DB Sync Actions */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
                  <div>
                    <span className="text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      Disaster Recovery
                    </span>
                    <h4 className="text-sm font-bold text-white mt-2">Universal Backup Hub</h4>
                    <p className="text-xs text-slate-400 mt-1">Pull or push full state data anytime to override local cache leaks.</p>
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    <button
                      onClick={async () => {
                        showToast("Initiating Neon DB Hard Sync...");
                        try {
                          const activeSeriesList = activeSeries ? [activeSeries] : [];
                          const res = await fetch('/api/db/sync-all', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              seriesList: activeSeriesList,
                              episodes: activeEpisode ? [activeEpisode] : [],
                              characters,
                              environments,
                              scenes: [],
                              mangaPages: historyPages
                            })
                          });
                          const data = await res.json();
                          if (data.success) {
                            showToast("✨ Full Studio State Persisted to Neon Database!");
                          } else {
                            alert("Sync failed: " + data.message);
                          }
                        } catch (err: any) {
                          alert("Sync network error: " + err.message);
                        }
                      }}
                      className="flex-1 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
                    >
                      Backup Now
                    </button>
                    <button
                      onClick={fetchStorageFiles}
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs transition-all cursor-pointer"
                      title="Reload Cloud Directory"
                    >
                      <RefreshCw className={`h-4 w-4 ${isFetchingStorage ? 'animate-spin' : ''}`} />
                    </button>
                  </div>
                </div>
              </div>

              {/* UPLOAD CUSTOM ASSET ENGINE */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>Store Custom Local Asset on Vercel Blob Cloud</span>
                    <span className="text-[10px] font-mono text-slate-500">• Upload bypasses size limits</span>
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">Vault Category:</span>
                    <select
                      value={blobUploadCategory}
                      onChange={(e: any) => setBlobUploadCategory(e.target.value)}
                      className="bg-slate-950 border border-slate-800 rounded-lg text-xs px-2.5 py-1 text-slate-300 outline-none focus:border-indigo-500"
                    >
                      <option value="characters">Characters Sheet Vault</option>
                      <option value="environments">Environment Background Vault</option>
                      <option value="panels">Manga Panels Container</option>
                      <option value="manga-pages">Assembled Pages Gallery</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                  <div className="md:col-span-3">
                    <label className="flex flex-col items-center justify-center h-28 border-2 border-dashed border-slate-800 hover:border-indigo-500/50 rounded-2xl bg-slate-950/50 cursor-pointer transition-all group">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="h-6 w-6 text-slate-500 group-hover:text-indigo-400 mb-2 transition-all" />
                        <p className="text-xs text-slate-400 group-hover:text-slate-200 transition-all">
                          {isUploadingToBlob ? "Transmitting data..." : "Click or Drag to Upload Any Image Asset"}
                        </p>
                        <p className="text-[10px] text-slate-600 font-mono mt-1">PNG, JPG, WEBP up to 50MB</p>
                      </div>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handleUploadCustomFile}
                        disabled={isUploadingToBlob} 
                      />
                    </label>
                  </div>

                  <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 h-28 flex flex-col justify-between">
                    <span className="text-[10px] text-slate-500 font-mono font-bold uppercase">Pipeline Hook</span>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Uploading to <span className="text-indigo-400 font-semibold">{blobUploadCategory}</span> automatically updates reference libraries on active pages.
                    </p>
                  </div>
                </div>
              </div>

              {/* CLOUD FILES FILE EXPLORER */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white font-['Cinzel',serif]">Isolated Cloud Files Explorer</h3>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-slate-400 bg-slate-900 border border-slate-800 rounded px-2 py-0.5 font-mono">
                      Dir: /user_usr_8829_alpha_neon/
                    </span>
                  </div>
                </div>

                {isFetchingStorage ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-3">
                    <RefreshCw className="h-8 w-8 text-indigo-500 animate-spin" />
                    <span className="text-xs text-slate-400 font-mono">Scanning cloud cluster file nodes...</span>
                  </div>
                ) : storageFiles.length === 0 ? (
                  <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-12 text-center text-slate-500 text-xs">
                    No records found in this category. Use the upload tool above to seed your Vercel Blob bucket.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {storageFiles.map((file, idx) => (
                      <div 
                        key={idx} 
                        className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg flex flex-col justify-between group hover:border-slate-700 transition-all relative animate-fadeIn"
                      >
                        {/* Thumbnail */}
                        <div className="aspect-[4/3] bg-slate-950 flex items-center justify-center overflow-hidden border-b border-slate-800/50 relative">
                          <img 
                            src={file.url} 
                            alt={file.filename} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-all"
                            referrerPolicy="no-referrer"
                          />
                          <span className="absolute top-2 right-2 text-[9px] font-mono bg-slate-950/80 text-sky-400 border border-slate-800 px-1.5 py-0.5 rounded font-bold uppercase">
                            {file.category}
                          </span>
                        </div>

                        {/* Info & Details */}
                        <div className="p-3 space-y-2">
                          <p className="text-[11px] font-bold text-slate-200 truncate" title={file.filename}>
                            {file.filename}
                          </p>
                          <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                            <span>{(file.size / 1024).toFixed(1)} KB</span>
                            <span className="capitalize">{file.driver === 'vercel_blob' ? 'Vercel Blob' : 'SSD Storage'}</span>
                          </div>

                          <div className="flex gap-1.5 pt-1">
                            <a 
                              href={file.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex-1 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold rounded text-center transition-all"
                            >
                              View URL
                            </a>
                            <button
                              onClick={() => handleDeleteStorageFile(file.url)}
                              className="px-2 py-1 bg-rose-950/50 hover:bg-rose-900 border border-rose-500/20 text-rose-400 text-[10px] font-bold rounded transition-all cursor-pointer"
                              title="Delete from cloud permanently"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      )}

      {/* LIVE TOAST NOTIFICATION BANNER */}
      {toastNotification && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border-2 border-rose-500/80 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-fadeIn backdrop-blur-md">
          <Sparkles className="h-5 w-5 text-amber-400 animate-spin" />
          <span className="text-xs font-mono font-bold">{toastNotification}</span>
        </div>
      )}

      {/* LIVE ASSEMBLED PAGE LIGHTBOX MODAL */}
      {assembledPageModal && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 sm:p-6 overflow-hidden backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[95vh] flex flex-col shadow-2xl relative overflow-hidden animate-fadeIn">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-950/90 z-10">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 bg-rose-500/20 rounded-xl flex items-center justify-center text-rose-400 border border-rose-500/30">
                  <Printer className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white font-['Cinzel',serif] flex items-center gap-2">
                    <span>Live Assembled Page</span>
                    <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                      Page {assembledPageModal.pageNumber} • Chapter {assembledPageModal.chapterNumber}
                    </span>
                  </h2>
                  <p className="text-[11px] text-slate-400">{assembledPageModal.title}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => downloadDataUrl(assembledPageModal.pageImageObj, `manga_c${assembledPageModal.chapterNumber}_p${assembledPageModal.pageNumber}.jpg`)}
                  className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer active:scale-95"
                >
                  <Download className="h-4 w-4" />
                  <span>Download JPG</span>
                </button>

                <button
                  onClick={() => handleCopyAssembledImage(assembledPageModal.pageImageObj)}
                  className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95"
                  title="Copy assembled image to clipboard"
                >
                  <Copy className="h-4 w-4 text-amber-400" />
                  <span>Copy</span>
                </button>

                <button
                  onClick={handleExportChapterZip}
                  disabled={isExportingZip}
                  className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer active:scale-95"
                >
                  {isExportingZip ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Layers className="h-4 w-4" />}
                  <span>Export Chapter (ZIP)</span>
                </button>

                <button
                  onClick={() => setAssembledPageModal(null)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Body - Image Preview */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-950 flex flex-col items-center justify-center">
              <div className="relative border-8 border-black rounded-2xl overflow-hidden shadow-2xl max-w-2xl w-full bg-white">
                <img
                  src={assembledPageModal.pageImageObj}
                  alt={`Assembled Page ${assembledPageModal.pageNumber}`}
                  className="w-full h-auto object-contain"
                />
              </div>
              <p className="text-[10px] text-slate-400 font-mono mt-3 text-center">
                High-Resolution (2.5x DPI) Canvas Snapshot • Typography & Speech Bubbles Vector-Overlay Locked
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
