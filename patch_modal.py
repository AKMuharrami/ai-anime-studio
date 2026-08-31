import re

with open('src/components/ProjectRouterModal.tsx', 'r') as f:
    code = f.read()

# Update the useEffect for routes
search_effect = r"      if \(initialRoute === 'SHORT_FORM'\) \{.*?\} else \{"
replace_effect = """      if (initialRoute === 'SHORT_FORM') {
        setEpisodeTitle('Short 1: Kinetic High-Speed Duel');
      } else if (initialRoute === 'MANGA_STUDIO' || initialRoute?.startsWith('MANGA_')) {
        setEpisodeTitle('Chapter 1: The Broken Code Matrix');
        setSeriesTitle(initialPreset?.title || 'NEW MANGA VOLUME');
        setArtStyleSeed(initialPreset?.artStyle || 'GEKIGA_INK_WASH_MONOCHROME_HIGH_CONTRAST');
        setGlobalLore(initialPreset?.description || 'A brand new manga story ready to be built panel by panel.');
        setPlotPrompt('Initiating page 1 blueprint layout...');
      } else {"""

code = re.sub(search_effect, replace_effect, code, flags=re.DOTALL)

with open('src/components/ProjectRouterModal.tsx', 'w') as f:
    f.write(code)

print("ProjectRouterModal patched.")
