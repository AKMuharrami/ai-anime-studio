import re

with open('src/components/ProjectRouterModal.tsx', 'r') as f:
    code = f.read()

code = code.replace("Detective Ren investigates a flickering neon nightclub where illegal cognitive chips are auctioned. Enforcer Lyra intercepts him, triggering a high-stakes standoff.", "Investigator Ren uncovers a corrupted data archive where illegal cognitive chips are distributed. Enforcer Lyra intercepts him, triggering a high-stakes tactical standoff. Modest tactical attire, sharia-compliant themes.")

with open('src/components/ProjectRouterModal.tsx', 'w') as f:
    f.write(code)

