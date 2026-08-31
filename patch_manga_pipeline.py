import re

with open('src/components/MangaStudioTab.tsx', 'r') as f:
    code = f.read()

# 1. Update initial state for mangaPlotConcept
search_plot = r"const \[mangaPlotConcept, setMangaPlotConcept\] = useState\([\s\S]*?\);"
replace_plot = """  const [mangaPlotConcept, setMangaPlotConcept] = useState(() => {
    if (activeEpisode?.full_script_json?.logline) return activeEpisode.full_script_json.logline;
    if (activeEpisode?.route === 'MANGA_SINGLE_PAGE') return "A hyper-detailed single splash page illustration of Kaelen facing off against Lyra in a neon-drenched server core. Maximum impact and dramatic perspective.";
    if (activeEpisode?.route === 'MANGA_VOLUME') return "An epic multi-chapter volume saga starting with Kaelen breaking into the SiliconFlow mainframes, setting off a massive chain reaction across Neo-Kyoto. Lyra begins her relentless hunt.";
    return "In a high-intensity cyber duel, Kaelen decodes an illegal cognitive chip while under fire. Lyra, the cyber-enforcer, storms the server room with her obsidian katana ignited, demanding the chip's core.";
  });"""
code = re.sub(search_plot, replace_plot, code)

# 2. Update simulate script to adapt to scope
search_gen = r"const handleGenerateMangaScript = \(\) => \{[\s\S]*?\}, 1500\);\n  \};"
replace_gen = """  const handleGenerateMangaScript = () => {
    setIsGeneratingScript(true);
    setTimeout(() => {
      let freshPanels: MangaPanel[] = [];
      
      if (mangaScope === 'single_page') {
        freshPanels = [
          {
            id: 'panel_1',
            panelIndex: 1,
            layoutClass: 'col-span-12 row-span-4 h-[600px]',
            charactersPresent: ['Kaelen', 'Lyra'],
            expression: 'Fierce, dramatic eye contact in a standoff',
            equipment: '',
            actionPrompt: 'A massive double-spread splash page. Kaelen and Lyra standing opposite each other in a colossal neon server matrix. High contrast screentones, extreme dynamic perspective, speed lines rushing towards the center.',
            speechText: "This ends here, Enforcer! The core is mine!",
            bubbleStyle: 'burst',
            bubbleX: 20,
            bubbleY: 20,
            bubbleScale: 1.2,
            bgUrl: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=1200',
            charSheetUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=600',
            imageUrl: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=1200',
            isRendered: true,
            renderingStatus: 'COMPLETED'
          }
        ];
      } else {
        // Standard Chapter or Volume Pipeline (4 panels)
        freshPanels = [
          {
            id: 'panel_1',
            panelIndex: 1,
            layoutClass: 'col-span-12 row-span-2 h-72 md:h-80',
            charactersPresent: ['Kaelen'],
            expression: 'Desperate, focus-ridden glare, veins on temple showing',
            equipment: '',
            actionPrompt: 'Black and white manga illustration, Kaelen typing on neon matrix server. Hologram rings floating, high contrast screentone style.',
            speechText: "The core is 95% complete... but my cyber-deck is overheating!",
            bubbleStyle: 'burst',
            bubbleX: 30,
            bubbleY: 25,
            bubbleScale: 1.0,
            bgUrl: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=1200',
            charSheetUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=600',
            imageUrl: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=1200',
            isRendered: true,
            renderingStatus: 'COMPLETED'
          },
          {
            id: 'panel_2',
            panelIndex: 2,
            layoutClass: 'col-span-6 row-span-1 h-56 md:h-64',
            charactersPresent: ['Lyra'],
            expression: 'Fierce grin, heavy shadows under eyes',
            equipment: '',
            actionPrompt: 'Lyra cutting through heavy server cables. Spark explosions in black and white screentone. Screws and sparks flying outward.',
            speechText: "No time left, hacker! The security node has crashed!",
            bubbleStyle: 'burst',
            bubbleX: 55,
            bubbleY: 20,
            bubbleScale: 0.95,
            bgUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=1200',
            charSheetUrl: 'https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=600',
            imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200',
            isRendered: true,
            renderingStatus: 'COMPLETED'
          },
          {
            id: 'panel_3',
            panelIndex: 3,
            layoutClass: 'col-span-6 row-span-1 h-56 md:h-64',
            charactersPresent: ['Kaelen'],
            expression: 'Terrified, pupils dilated',
            equipment: '',
            actionPrompt: 'Kaelen looking over her shoulder as a huge shadow falls across the terminal. Heavy black shading ink style, high contrast.',
            speechText: "Wait... that shadow! She's right behind me!",
            bubbleStyle: 'thought',
            bubbleX: 50,
            bubbleY: 40,
            bubbleScale: 1.0,
            bgUrl: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=1200',
            charSheetUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=600',
            imageUrl: 'https://images.unsplash.com/photo-1614741118887-7a4ee193a5fa?q=80&w=1200',
            isRendered: true,
            renderingStatus: 'COMPLETED'
          },
          {
            id: 'panel_4',
            panelIndex: 4,
            layoutClass: 'col-span-12 row-span-2 h-72 md:h-80',
            charactersPresent: ['Lyra'],
            expression: 'Monolithic, merciless gaze, sword raised',
            equipment: '',
            actionPrompt: 'Lyra pointing sword forward. Heavy ink washes, screaming speed lines, classic Gekiga manga texture.',
            speechText: "SiliconFlow has processed your sentence. PURGE THE CHIP!",
            bubbleStyle: 'burst',
            bubbleX: 70,
            bubbleY: 35,
            bubbleScale: 1.15,
            bgUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=1200',
            charSheetUrl: 'https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=600',
            imageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1200',
            isRendered: true,
            renderingStatus: 'COMPLETED'
          }
        ];
      }
      
      setPanels(freshPanels);
      setIsGeneratingScript(false);
      setActiveWorkflowStep(2); // Auto proceed to Character step
    }, 1500);
  };"""

code = re.sub(search_gen, replace_gen, code)

with open('src/components/MangaStudioTab.tsx', 'w') as f:
    f.write(code)

print("Patch applied.")
