import re

with open('src/components/MangaStudioTab.tsx', 'r') as f:
    code = f.read()

# Make mangaPlotConcept start empty if no logline
search_plot = r"const \[mangaPlotConcept, setMangaPlotConcept\] = useState\(\(\) => \{[\s\S]*?\}\);"
replace_plot = """  const [mangaPlotConcept, setMangaPlotConcept] = useState(() => {
    if (activeEpisode?.full_script_json?.logline) return activeEpisode.full_script_json.logline;
    return "";
  });"""
code = re.sub(search_plot, replace_plot, code)

# Update placeholder in textarea
search_placeholder = r'placeholder=\{[\s\S]*?\n\s*\}'
replace_placeholder = """placeholder={
                      mangaScope === 'single_page' 
                        ? "e.g., A dramatic double-spread splash page showing Kaelen leaping from a cyber-tower. Modest tactical attire, sharia-compliant..."
                        : mangaScope === 'full_story'
                        ? "e.g., A sprawling sci-fi saga starting with Kaelen discovering a hidden data matrix. All characters wear modest clothing..."
                        : "e.g., A focused chapter where Kaelen infiltrates the server core. Honorable themes, sharia-compliant modest character designs..."
                    }"""
code = re.sub(search_placeholder, replace_placeholder, code)

# Update simulated script panels to be Sharia-compliant
code = code.replace("Honorable samurai protagonist with dark messy hair, intense black eyes, wearing dynamic tattered robes.", "Honorable samurai protagonist with dark messy hair, intense black eyes, wearing modest traditional robes covering full body.")
code = code.replace("Lyra cutting through heavy server cables. Spark explosions in black and white screentone. Screws and sparks flying outward.", "Lyra cutting through heavy server cables. Spark explosions in black and white screentone. Screws and sparks flying outward. She is wearing modest armor.")
code = code.replace("Lyra pointing sword forward. Heavy ink washes, screaming speed lines, classic Gekiga manga texture.", "Lyra pointing sword forward. Heavy ink washes, screaming speed lines, classic Gekiga manga texture. Modest tactical armor.")

with open('src/components/MangaStudioTab.tsx', 'w') as f:
    f.write(code)

