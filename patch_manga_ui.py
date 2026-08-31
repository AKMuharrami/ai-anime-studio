import re

with open('src/components/MangaStudioTab.tsx', 'r') as f:
    code = f.read()

# Update UI for Step 1
search_ui = r"""                  <label className="block text-xs font-semibold text-slate-300">
                    Manga Story Concept Prompt
                  </label>"""
replace_ui = """                  <label className="block text-xs font-semibold text-slate-300">
                    {mangaScope === 'single_page' ? 'Single Page Blueprint Concept' : mangaScope === 'full_story' ? 'Volume Saga Concept' : 'Chapter Arc Concept'}
                  </label>"""

code = code.replace(search_ui, replace_ui)

with open('src/components/MangaStudioTab.tsx', 'w') as f:
    f.write(code)

print("Patch applied to MangaStudioTab.")
