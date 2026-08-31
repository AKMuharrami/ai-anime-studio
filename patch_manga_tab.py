import re

with open('src/components/MangaStudioTab.tsx', 'r') as f:
    code = f.read()

props_search = r"interface MangaStudioTabProps \{"
props_replace = r"interface MangaStudioTabProps {\n  deductTokens: (cost: number, reason: string) => Promise<boolean>;"
code = re.sub(props_search, props_replace, code)

comp_search = r"export const MangaStudioTab: React\.FC<MangaStudioTabProps> = \(\{\n  activeSeries,\n  activeEpisode,\n  characters,\n  environments,\n  onAddCharacter,\n  onAddEnvironment,\n  onBackToHome\n\}\) => \{"
comp_replace = r"""export const MangaStudioTab: React.FC<MangaStudioTabProps> = ({
  activeSeries,
  activeEpisode,
  characters,
  environments,
  onAddCharacter,
  onAddEnvironment,
  onBackToHome,
  deductTokens
}) => {"""
code = re.sub(comp_search, comp_replace, code)

# Generation logic inside MangaStudioTab
parse_search = r"const handleGenerateScript = async \(\) => \{\n    if \(!scriptPrompt\) return;\n    setIsGeneratingScript\(true\);"
parse_replace = r"""const handleGenerateScript = async () => {
    if (!scriptPrompt) return;
    const canAfford = await deductTokens(40, "DeepSeek Manga Layout Engine");
    if (!canAfford) return;
    setIsGeneratingScript(true);"""
code = re.sub(parse_search, parse_replace, code)

render_search = r"const handleRenderPanel = async \(panelId: string, customPrompt: string\) => \{\n    setRenderingPanels\(prev => \(\{\.\.\.prev, \[panelId\]: true\}\)\);"
render_replace = r"""const handleRenderPanel = async (panelId: string, customPrompt: string) => {
    const canAfford = await deductTokens(15, "Qwen 2.5-VL Manga Panel Generation");
    if (!canAfford) return;
    setRenderingPanels(prev => ({...prev, [panelId]: true}));"""
code = re.sub(render_search, render_replace, code)

with open('src/components/MangaStudioTab.tsx', 'w') as f:
    f.write(code)

