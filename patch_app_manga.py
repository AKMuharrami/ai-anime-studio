import re

with open('src/App.tsx', 'r') as f:
    code = f.read()

manga_search = r"(<MangaStudioTab[\s\S]*?onBackToHome=\{[\s\S]*?\})"
manga_replace = r"\1\n                deductTokens={deductTokens}"
code = re.sub(manga_search, manga_replace, code)

with open('src/App.tsx', 'w') as f:
    f.write(code)

