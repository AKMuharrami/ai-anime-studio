import re

with open('src/components/TimelineCompilerTab.tsx', 'r') as f:
    code = f.read()

props_search = r"interface TimelineCompilerTabProps \{"
props_replace = r"interface TimelineCompilerTabProps {\n  deductTokens: (cost: number, reason: string) => Promise<boolean>;"
code = re.sub(props_search, props_replace, code)

comp_search = r"export const TimelineCompilerTab: React\.FC<TimelineCompilerTabProps> = \(\{\n  activeSeries,\n  activeEpisode,\n  scenes,\n  characters,\n  environments,\n  onUpdateEpisodeMasterVideo,\n  onSpawnSequel,\n  onBackToSeedance,\n  onBackToHome\n\}\) => \{"
comp_replace = r"""export const TimelineCompilerTab: React.FC<TimelineCompilerTabProps> = ({
  activeSeries,
  activeEpisode,
  scenes,
  characters,
  environments,
  onUpdateEpisodeMasterVideo,
  onSpawnSequel,
  onBackToSeedance,
  onBackToHome,
  deductTokens
}) => {"""
code = re.sub(comp_search, comp_replace, code)

gen_search = r"const handleCompileMaster = async \(\) => \{\n    setIsCompiling\(true\);"
gen_replace = r"""const handleCompileMaster = async () => {
    const canAfford = await deductTokens(300, "Vercel Video Timeline Compilation (4K Master)");
    if (!canAfford) return;
    setIsCompiling(true);"""
code = re.sub(gen_search, gen_replace, code)

with open('src/components/TimelineCompilerTab.tsx', 'w') as f:
    f.write(code)

