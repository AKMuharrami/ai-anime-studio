import re

with open('src/components/StudioHomePage.tsx', 'r') as f:
    code = f.read()

import_search = r"import \{\s*Film,"
import_replace = r"import { BookOpen, Wand2, Film,"
code = re.sub(import_search, import_replace, code)

with open('src/components/StudioHomePage.tsx', 'w') as f:
    f.write(code)
