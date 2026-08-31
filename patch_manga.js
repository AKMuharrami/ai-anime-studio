const fs = require('fs');
let code = fs.readFileSync('src/components/MangaStudioTab.tsx', 'utf8');

if (!code.includes("import html2canvas from 'html2canvas';")) {
  code = code.replace("import { Scene", "import html2canvas from 'html2canvas';\nimport { Scene");
}

if (!code.includes("interface MangaPageRecord")) {
  const insertTypesBefore = "export const MangaStudioTab";
  const typesCode = `
interface MangaPageRecord {
  id: string;
  pageNumber: number;
  chapterNumber: number;
  panels: MangaPanel[];
  pageImageObj?: string;
}
`;
  code = code.replace(insertTypesBefore, typesCode + "\n" + insertTypesBefore);
}

if (!code.includes("const [historyPages")) {
  const insertStateAfter = "const [currentChapter, setCurrentChapter] = useState<number>(1);";
  const stateCode = `
  const [historyPages, setHistoryPages] = useState<MangaPageRecord[]>([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const [showChapterPreview, setShowChapterPreview] = useState(false);
`;
  code = code.replace(insertStateAfter, insertStateAfter + "\n" + stateCode);
}

fs.writeFileSync('src/components/MangaStudioTab.tsx', code);
console.log("Initial types and states patched.");
