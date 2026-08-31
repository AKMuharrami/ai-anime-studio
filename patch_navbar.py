import re

with open('src/components/Navbar.tsx', 'r') as f:
    code = f.read()

slogan_search = r"Zero-to-Episode AI Animation Platform"
slogan_replace = r"Zero-to-Chapter AI Manga Platform"
code = re.sub(slogan_search, slogan_replace, code)

with open('src/components/Navbar.tsx', 'w') as f:
    f.write(code)

