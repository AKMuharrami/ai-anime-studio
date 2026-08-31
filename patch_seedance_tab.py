import re

with open('src/components/SeedanceMultimodalStudioTab.tsx', 'r') as f:
    code = f.read()

props_search = r"interface SeedanceMultimodalStudioTabProps \{"
props_replace = r"interface SeedanceMultimodalStudioTabProps {\n  deductTokens: (cost: number, reason: string) => Promise<boolean>;"
code = re.sub(props_search, props_replace, code)

comp_search = r"export const SeedanceMultimodalStudioTab: React\.FC<SeedanceMultimodalStudioTabProps> = \(\{\n  activeSeries,\n  activeEpisode,\n  scenes,\n  characters,\n  environments,\n  onUpdateScene,\n  onProceedToSound,\n  onProceedToTimeline,\n  onBackToVault\n\}\) => \{"
comp_replace = r"""export const SeedanceMultimodalStudioTab: React.FC<SeedanceMultimodalStudioTabProps> = ({
  activeSeries,
  activeEpisode,
  scenes,
  characters,
  environments,
  onUpdateScene,
  onProceedToSound,
  onProceedToTimeline,
  onBackToVault,
  deductTokens
}) => {"""
code = re.sub(comp_search, comp_replace, code)

gen_search = r"const handleRenderScene = async \(sceneId: string, customPrompt: string\) => \{\n    setRenderingScenes\(prev => \(\{\.\.\.prev, \[sceneId\]: true\}\)\);"
gen_replace = r"""const handleRenderScene = async (sceneId: string, customPrompt: string) => {
    const canAfford = await deductTokens(150, "Seedance 2.5 High-Fidelity Video Render");
    if (!canAfford) return;
    setRenderingScenes(prev => ({...prev, [sceneId]: true}));"""
code = re.sub(gen_search, gen_replace, code)

with open('src/components/SeedanceMultimodalStudioTab.tsx', 'w') as f:
    f.write(code)

