import re

with open('src/components/MangaStudioTab.tsx', 'r') as f:
    code = f.read()

search_placeholder = r'placeholder="Enter story arc details\.\.\."'
replace_placeholder = """placeholder={
                      mangaScope === 'single_page' 
                        ? "e.g., A dramatic double-spread splash page showing Kaelen leaping from a neon skyscraper, katana drawn..."
                        : mangaScope === 'full_story'
                        ? "e.g., A sprawling cyberpunk saga starting with Kaelen discovering a hidden code matrix in the underworld, pursued by Enforcer Lyra across Neo-Kyoto..."
                        : "e.g., A focused chapter where Kaelen infiltrates the server core, defeats two cyber-guards, and successfully extracts the chip."
                    }"""

code = re.sub(search_placeholder, replace_placeholder, code)

with open('src/components/MangaStudioTab.tsx', 'w') as f:
    f.write(code)

print("Placeholder patched.")
