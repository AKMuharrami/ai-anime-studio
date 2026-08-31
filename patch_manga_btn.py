import re

with open('src/components/MangaStudioTab.tsx', 'r') as f:
    code = f.read()

search_btn = r"<span>Generate Chapter Panels</span>"
replace_btn = """<span>
                  {mangaScope === 'single_page' ? 'Generate Page Blueprint' : mangaScope === 'full_story' ? 'Generate Volume Chapter' : 'Generate Chapter Panels'}
                </span>"""
code = code.replace(search_btn, replace_btn)

with open('src/components/MangaStudioTab.tsx', 'w') as f:
    f.write(code)

print("Button text updated.")
