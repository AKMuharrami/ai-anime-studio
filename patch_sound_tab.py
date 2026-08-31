import re

with open('src/components/SoundVoiceStudioTab.tsx', 'r') as f:
    code = f.read()

props_search = r"interface SoundVoiceStudioTabProps \{"
props_replace = r"interface SoundVoiceStudioTabProps {\n  deductTokens: (cost: number, reason: string) => Promise<boolean>;"
code = re.sub(props_search, props_replace, code)

comp_search = r"export const SoundVoiceStudioTab: React\.FC<SoundVoiceStudioTabProps> = \(\{\n  activeSeries,\n  activeEpisode,\n  scenes,\n  characters,\n  onUpdateScene,\n  onProceedToTimeline,\n  onBackToSeedance\n\}\) => \{"
comp_replace = r"""export const SoundVoiceStudioTab: React.FC<SoundVoiceStudioTabProps> = ({
  activeSeries,
  activeEpisode,
  scenes,
  characters,
  onUpdateScene,
  onProceedToTimeline,
  onBackToSeedance,
  deductTokens
}) => {"""
code = re.sub(comp_search, comp_replace, code)

gen_search = r"const handleGenerateAudioForScene = async \(sceneId: string, dialogueLines: any\[\]\) => \{\n    setGeneratingAudio\(prev => \(\{\.\.\.prev, \[sceneId\]: true\}\)\);"
gen_replace = r"""const handleGenerateAudioForScene = async (sceneId: string, dialogueLines: any[]) => {
    const cost = Math.max(10, dialogueLines.length * 5); // 5 tokens per line, min 10
    const canAfford = await deductTokens(cost, "Fish Audio Multilingual Dubbing & BGM");
    if (!canAfford) return;
    setGeneratingAudio(prev => ({...prev, [sceneId]: true}));"""
code = re.sub(gen_search, gen_replace, code)

with open('src/components/SoundVoiceStudioTab.tsx', 'w') as f:
    f.write(code)

