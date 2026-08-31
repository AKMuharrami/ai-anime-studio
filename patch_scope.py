import re

with open('src/components/MangaStudioTab.tsx', 'r') as f:
    code = f.read()

# Replace the useState initialization
search_scope = r"const \[mangaScope, setMangaScope\] = useState<'single_page' \| 'single_chapter' \| 'full_story'>\('single_chapter'\);"
replace_scope = """  const getInitialScope = () => {
    if (activeEpisode?.route === 'MANGA_SINGLE_PAGE') return 'single_page';
    if (activeEpisode?.route === 'MANGA_VOLUME') return 'full_story';
    return 'single_chapter';
  };
  const [mangaScope, setMangaScope] = useState<'single_page' | 'single_chapter' | 'full_story'>(getInitialScope());"""

code = re.sub(search_scope, replace_scope, code)

with open('src/components/MangaStudioTab.tsx', 'w') as f:
    f.write(code)

print("MangaStudioTab patched.")
