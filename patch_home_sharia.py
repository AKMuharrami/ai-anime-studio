import re

with open('src/components/MangaStudioHomePage.tsx', 'r') as f:
    code = f.read()

code = code.replace(
    'In a dark, grid-locked cyberspace server room, a young hacker attempts to unlock an illegal quantum mind-core while under corporate laser fire.',
    'In a dark, grid-locked cyberspace server room, a skilled programmer works to dismantle a corrupted AI mind-core while under corporate laser fire. Sharia-compliant modest tactical clothing.'
)

code = code.replace(
    'A quiet, determined guardian defends a colossal floating celestial temple from descending ink-shadow demons, drawing a pure light broadsword.',
    'A determined guardian defends a grand ancient fortress from invading rogue mechanical drones, drawing a master-crafted broadsword. Modest attire, honorable themes.'
)
code = code.replace(
    'High Fantasy & Ink Brush Style',
    'Historical Fiction & Ink Brush Style'
)

with open('src/components/MangaStudioHomePage.tsx', 'w') as f:
    f.write(code)

