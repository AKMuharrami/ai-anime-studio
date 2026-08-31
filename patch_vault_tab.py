import re

with open('src/components/StudioDesignVaultTab.tsx', 'r') as f:
    code = f.read()

props_search = r"interface StudioDesignVaultTabProps \{"
props_replace = r"interface StudioDesignVaultTabProps {\n  deductTokens: (cost: number, reason: string) => Promise<boolean>;"
code = re.sub(props_search, props_replace, code)

comp_search = r"export const StudioDesignVaultTab: React\.FC<StudioDesignVaultTabProps> = \(\{\n  activeSeries,\n  activeEpisode,\n  characters,\n  environments,\n  scenes,\n  onAddCharacter,\n  onAddEnvironment,\n  onBatchAddEntities,\n  onProceedToSeedance,\n  onBackToScript\n\}\) => \{"
comp_replace = r"""export const StudioDesignVaultTab: React.FC<StudioDesignVaultTabProps> = ({
  activeSeries,
  activeEpisode,
  characters,
  environments,
  scenes,
  onAddCharacter,
  onAddEnvironment,
  onBatchAddEntities,
  onProceedToSeedance,
  onBackToScript,
  deductTokens
}) => {"""
code = re.sub(comp_search, comp_replace, code)

char_gen_search = r"const handleGenerateCharacter = async \(id: string\) => \{\n    setGeneratingId\(id\);"
char_gen_replace = r"""const handleGenerateCharacter = async (id: string) => {
    const canAfford = await deductTokens(25, "Qwen 2.5-VL Character Model Generation");
    if (!canAfford) return;
    setGeneratingId(id);"""
code = re.sub(char_gen_search, char_gen_replace, code)

env_gen_search = r"const handleGenerateEnvironment = async \(id: string\) => \{\n    setGeneratingId\(id\);"
env_gen_replace = r"""const handleGenerateEnvironment = async (id: string) => {
    const canAfford = await deductTokens(25, "Qwen 2.5-VL Environment Keyframe Generation");
    if (!canAfford) return;
    setGeneratingId(id);"""
code = re.sub(env_gen_search, env_gen_replace, code)

with open('src/components/StudioDesignVaultTab.tsx', 'w') as f:
    f.write(code)

