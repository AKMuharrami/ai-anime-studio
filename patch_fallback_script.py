import re

with open('src/components/ScriptTimelineParserTab.tsx', 'r') as f:
    code = f.read()

code = code.replace("Neo-Kyoto Sector 4 Alleyway", "Grand Data Archive Entrance")
code = code.replace("Sub-Zero Cognitive Server Vault", "Historical Repository Mainframe")
code = code.replace("High-contrast neon alleyway rain sequence. Ren walks through mist, his cybernetic eye pulsing faint cobalt.", "High-contrast architectural layout. Tariq walks through the majestic gates, wearing modest long coats and observing the ancient mechanisms.")
code = code.replace("Ren enters the cryogenic server hall. Commander Tariq turns, adjusting his armored cloak as neural cables glow around the terminal.", "Tariq enters the repository. Zayd turns, adjusting his modest armored cloak, organizing the illuminated data scrolls.")
code = code.replace("Ren Takahashi", "Tariq")
code = code.replace("Commander Tariq Al-Mansoor", "Zayd")

with open('src/components/ScriptTimelineParserTab.tsx', 'w') as f:
    f.write(code)

