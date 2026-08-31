import re

with open('src/components/ScriptTimelineParserTab.tsx', 'r') as f:
    code = f.read()

# Make plotInput start empty
search_plot = r"const \[plotInput, setPlotInput\] = useState\([\s\S]*? \);"
replace_plot = """  const [plotInput, setPlotInput] = useState(
    activeEpisode?.full_script_json?.synopsis || ''
  );"""
code = re.sub(search_plot, replace_plot, code)

# Update placeholder
search_placeholder = r'placeholder="Enter the episode script, character confrontations, or high-level narrative plot\.\.\."'
replace_placeholder = 'placeholder="Enter the episode script or plot... (Ensure themes are honorable and characters wear modest, sharia-compliant attire)"'
code = code.replace(search_placeholder, replace_placeholder)

with open('src/components/ScriptTimelineParserTab.tsx', 'w') as f:
    f.write(code)

