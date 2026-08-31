const fs = require('fs');
let code = fs.readFileSync('src/components/MangaStudioTab.tsx', 'utf8');

const oldHandleNextPageRegex = /const handleNextPage = \(\) => \{[\s\S]*?window\.scrollTo\(\{ top: 0, behavior: 'smooth' \}\);\n  \};/m;

const newHandleNextPageAndExports = `
  const captureFullPage = async (): Promise<string | undefined> => {
    try {
      const pageNode = document.getElementById('manga-page-grid');
      if (!pageNode) return undefined;
      const canvas = await html2canvas(pageNode, { 
        useCORS: true, 
        scale: 2, 
        backgroundColor: '#000000' 
      });
      return canvas.toDataURL('image/jpeg', 0.9);
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

  const handleSavePanel = async (panelId: string, index: number) => {
    try {
      const panelNode = document.getElementById(\`manga-panel-\${panelId}\`);
      if (!panelNode) return;
      
      const originalRing = panelNode.className;
      panelNode.className = panelNode.className.replace(/ring-[^\\s]+/g, '').replace(/border-[^\\s]+/g, '');
      
      const canvas = await html2canvas(panelNode, { useCORS: true, scale: 2 });
      panelNode.className = originalRing;
      
      downloadDataUrl(canvas.toDataURL('image/jpeg', 0.9), \`chapter\${currentChapter}_page\${currentPage}_panel\${index + 1}.jpg\`);
    } catch (err) {
      console.error("Failed to export panel:", err);
      alert("Failed to export panel image.");
    }
  };

  const handleSaveFullChapter = () => {
    if (historyPages.length === 0) {
      alert("No pages have been completed yet to save.");
      return;
    }
    // Simple approach: Trigger download for each saved page image.
    historyPages.forEach((hp, idx) => {
      if (hp.pageImageObj) {
        setTimeout(() => {
          downloadDataUrl(hp.pageImageObj!, \`manga_c\${hp.chapterNumber}_p\${hp.pageNumber}.jpg\`);
        }, idx * 500); // Stagger downloads
      }
    });
  };

  const handleNextPage = async () => {
    if (mangaScope === 'single_page') {
      alert("You're in Single Page scope. Switch to Single Chapter or Full Story to continue to the next page.");
      return;
    }
    
    setIsCapturing(true);
    const capturedDataUrl = await captureFullPage();
    setIsCapturing(false);

    setHistoryPages(prev => [...prev, {
      id: \`c\${currentChapter}_p\${currentPage}_\${Date.now()}\`,
      pageNumber: currentPage,
      chapterNumber: currentChapter,
      panels: [...panels],
      pageImageObj: capturedDataUrl
    }]);
    
    // Increment logic
    if (mangaScope === 'single_chapter') {
      setCurrentPage(prev => prev + 1);
    } else if (mangaScope === 'full_story') {
      if (currentPage >= 20) {
        setCurrentChapter(prev => prev + 1);
        setCurrentPage(1);
      } else {
        setCurrentPage(prev => prev + 1);
      }
    }

    // Reset panel status but keep continuity characters/envs
    setPanels(prev => prev.map(p => ({
      ...p,
      isRendered: false,
      renderingStatus: 'IDLE',
      imageUrl: '',
      speechText: '',
      bgPrompt: '',
      characterPrompt: '',
      cameraAngle: '',
      layoutClass: p.layoutClass,
      bubbleStyle: 'oval'
    })));
    setMangaScript('');
    setActiveWorkflowStep(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };`;

if (oldHandleNextPageRegex.test(code)) {
  code = code.replace(oldHandleNextPageRegex, newHandleNextPageAndExports);
  fs.writeFileSync('src/components/MangaStudioTab.tsx', code);
  console.log("handleNextPage logic updated successfully.");
} else {
  console.error("Could not find handleNextPage to replace.");
}
