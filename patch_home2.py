import re

with open('src/components/MangaStudioHomePage.tsx', 'r') as f:
    code = f.read()

# Update the interface
code = code.replace("onSelectRouteAndCreate: (route: 'FULL_EPISODE' | 'SHORT_FORM' | 'MANGA_STUDIO') => void;", "onSelectRouteAndCreate: (route: any, preset?: any) => void;")

# Update the main Hero button to use Chapter mode
code = code.replace("onClick={() => onSelectRouteAndCreate('MANGA_STUDIO')}", "onClick={() => onSelectRouteAndCreate('MANGA_CHAPTER')}")

# Update the presets to pass the preset and route
code = code.replace("onClick={() => onSelectRouteAndCreate('MANGA_CHAPTER')}", "onClick={() => onSelectRouteAndCreate('MANGA_CHAPTER', preset)}")

with open('src/components/MangaStudioHomePage.tsx', 'w') as f:
    f.write(code)

print("MangaStudioHomePage fixed again.")
