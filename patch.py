import os
import re

with open('src/components/MangaStudioTab.tsx', 'r') as f:
    code = f.read()

# 1. Imports and Types
if "import html2canvas from 'html2canvas';" not in code:
    code = code.replace("import { Scene", "import html2canvas from 'html2canvas';\nimport { Scene")

if "interface MangaPageRecord" not in code:
    insertTypesBefore = "export const MangaStudioTab"
    typesCode = """
interface MangaPageRecord {
  id: string;
  pageNumber: number;
  chapterNumber: number;
  panels: MangaPanel[];
  pageImageObj?: string;
}
"""
    code = code.replace(insertTypesBefore, typesCode + "\n" + insertTypesBefore)

if "const [historyPages" not in code:
    insertStateAfter = "const [currentChapter, setCurrentChapter] = useState<number>(1);"
    stateCode = """
  const [historyPages, setHistoryPages] = useState<MangaPageRecord[]>([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const [showChapterPreview, setShowChapterPreview] = useState(false);
"""
    code = code.replace(insertStateAfter, insertStateAfter + "\n" + stateCode)

# 2. handleNextPage and export logic
oldHandleNextPageRegex = re.compile(r"const handleNextPage = \(\) => \{.*?window\.scrollTo\(\{ top: 0, behavior: 'smooth' \}\);\n  \};", re.DOTALL)

newHandleNextPageAndExports = r"""  const captureFullPage = async (): Promise<string | undefined> => {
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

  const handleSavePanel = async (panelId: string, index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const panelNode = document.getElementById(`manga-panel-${panelId}`);
      if (!panelNode) return;
      
      const originalRing = panelNode.className;
      panelNode.className = panelNode.className.replace(/ring-[^\s]+/g, '').replace(/border-rose-500/g, 'border-transparent');
      
      const canvas = await html2canvas(panelNode, { useCORS: true, scale: 2 });
      panelNode.className = originalRing;
      
      downloadDataUrl(canvas.toDataURL('image/jpeg', 0.9), `chapter${currentChapter}_page${currentPage}_panel${index + 1}.jpg`);
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
    historyPages.forEach((hp, idx) => {
      if (hp.pageImageObj) {
        setTimeout(() => {
          downloadDataUrl(hp.pageImageObj, `manga_c${hp.chapterNumber}_p${hp.pageNumber}.jpg`);
        }, idx * 600); // Stagger downloads
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
      id: `c${currentChapter}_p${currentPage}_${Date.now()}`,
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
  };"""

# Use string replace to avoid re template issues
code = code.replace(oldHandleNextPageRegex.search(code).group(0), newHandleNextPageAndExports)

# Add id to page grid so it can be captured
gridRegex = re.compile(r'(<div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4")')
if 'id="manga-page-grid"' not in code:
    code = gridRegex.sub(r'<div id="manga-page-grid" className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4"', code)

with open('src/components/MangaStudioTab.tsx', 'w') as f:
    f.write(code)

print("Patch Python Script Finished.")
