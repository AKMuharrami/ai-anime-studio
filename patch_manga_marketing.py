import re

with open('src/components/MangaStudioHomePage.tsx', 'r') as f:
    code = f.read()

para_search = r"Effortlessly craft world-class, story-driven manga from a single prompt\. Leverage our powerful AI layout engines and strictly enforced character identity vaults to generate beautiful, continuous chapters—complete with expressive panels and dialogue—instantly\."
para_replace = "Effortlessly craft world-class, story-driven manga from the storyline/plot to the consistent character/scene creation vault to the manga page panel creation to the text editor. Leverage our powerful AI layout engines and strictly enforced character identity vaults to generate beautiful, continuous chapters—complete with expressive panels and dialogue—instantly."

code = re.sub(para_search, para_replace, code)

with open('src/components/MangaStudioHomePage.tsx', 'w') as f:
    f.write(code)

