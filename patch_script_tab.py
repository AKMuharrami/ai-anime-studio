import re

with open('src/components/ScriptTimelineParserTab.tsx', 'r') as f:
    code = f.read()

# Add deductTokens to props
props_search = r"interface ScriptTimelineParserTabProps \{"
props_replace = r"interface ScriptTimelineParserTabProps {\n  deductTokens: (cost: number, reason: string) => Promise<boolean>;"
code = re.sub(props_search, props_replace, code)

# Destructure in component
comp_search = r"export const ScriptTimelineParserTab: React\.FC<ScriptTimelineParserTabProps> = \(\{\n  activeEpisode,\n  activeSeries,\n  onUpdateEpisodeScript,\n  onProceedToVault,\n  onBatchAddEntities\n\}\) => \{"
comp_replace = r"""export const ScriptTimelineParserTab: React.FC<ScriptTimelineParserTabProps> = ({
  activeEpisode,
  activeSeries,
  onUpdateEpisodeScript,
  onProceedToVault,
  onBatchAddEntities,
  deductTokens
}) => {"""
code = re.sub(comp_search, comp_replace, code)

# Modify the generator
handle_parse_search = r"const handleParse = async \(\) => \{\n    if \(!inputText\) return;\n    setIsGenerating\(true\);"
handle_parse_replace = r"""const handleParse = async () => {
    if (!inputText) return;
    
    // Deduct 50 Tokens for DeepSeek Parsing
    const canAfford = await deductTokens(50, "DeepSeek R1 Core Script Generation");
    if (!canAfford) return;
    
    setIsGenerating(true);"""
code = re.sub(handle_parse_search, handle_parse_replace, code)

with open('src/components/ScriptTimelineParserTab.tsx', 'w') as f:
    f.write(code)

