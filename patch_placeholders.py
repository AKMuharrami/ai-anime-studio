import re

with open('src/components/ProjectRouterModal.tsx', 'r') as f:
    code = f.read()

# Series Title
series_search = r"(<input\s*type=\"text\"\s*value=\{seriesTitle\}\s*onChange=\{\(e\) => setSeriesTitle\(e\.target\.value\)\}\s*required\s*className=\"[^\"]*\")(\s*/>)"
series_replace = r'\1\n                placeholder="e.g., Aethel: Cyber-Soul 2099"\2'
code = re.sub(series_search, series_replace, code)

# Episode Title
ep_search = r"(<input\s*type=\"text\"\s*value=\{episodeTitle\}\s*onChange=\{\(e\) => setEpisodeTitle\(e\.target\.value\)\}\s*required\s*className=\"[^\"]*\")(\s*/>)"
ep_replace = r'\1\n                placeholder="e.g., Chapter 1: The Neon Awakening"\2'
code = re.sub(ep_search, ep_replace, code)

# Art Style Seed
art_search = r"(<input\s*type=\"text\"\s*value=\{artStyleSeed\}\s*onChange=\{\(e\) => setArtStyleSeed\(e\.target\.value\)\}\s*required\s*className=\"[^\"]*\")(\s*/>)"
art_replace = r'\1\n                placeholder="e.g., 1990s dark fantasy OVA, high contrast Gekiga ink, cyberpunk neon"\2'
code = re.sub(art_search, art_replace, code)

# Global Lore
lore_search = r"(<input\s*type=\"text\"\s*value=\{globalLore\}\s*onChange=\{\(e\) => setGlobalLore\(e\.target\.value\)\}\s*className=\"[^\"]*\")(\s*/>)"
lore_replace = r'\1\n                placeholder="e.g., In a dystopian mega-city, rogue androids are hunted by cybernetic shamans..."\2'
code = re.sub(lore_search, lore_replace, code)

# Plot Prompt
plot_search = r"(placeholder=\")Describe the episode narrative arc, key action set-pieces, characters involved, and locations\.\.\.(\")"
plot_replace = r'\1e.g., Kael, a rogue cyber-shaman, discovers a hidden server vault beneath the city and must fight off three security drones using his neon katana to retrieve a stolen memory core...\2'
code = re.sub(plot_search, plot_replace, code)

with open('src/components/ProjectRouterModal.tsx', 'w') as f:
    f.write(code)

