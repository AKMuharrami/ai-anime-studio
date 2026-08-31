import os
import re

with open('src/components/MangaStudioTab.tsx', 'r') as f:
    code = f.read()

# 1. Interface
interface_search = """  charactersPresent: string[];
  expression: string;
  actionPrompt: string;"""
interface_replace = """  charactersPresent: string[];
  expression: string;
  equipment: string;
  actionPrompt: string;"""
code = code.replace(interface_search, interface_replace)

# 2. Initial state
# We need to add equipment: '' or something to panel 1, 2, 3, 4
panel_defaults_search = r"expression: '(.*?)',"
panel_defaults_replace = r"expression: '\1',\n      equipment: '',"
code = re.sub(panel_defaults_search, panel_defaults_replace, code)

# 3. reset in handleNextPage
reset_search = """      renderingStatus: 'IDLE',
      imageUrl: '',
      speechText: '',
      bgPrompt: '',
      characterPrompt: '',
      cameraAngle: '',
      layoutClass: p.layoutClass,"""
reset_replace = """      renderingStatus: 'IDLE',
      imageUrl: '',
      speechText: '',
      bgPrompt: '',
      characterPrompt: '',
      cameraAngle: '',
      equipment: '',
      layoutClass: p.layoutClass,"""
code = code.replace(reset_search, reset_replace)

# 4. editPrompt update
prompt_search = """Featuring character: ${charDesc}. Expression: ${activePanel.expression || 'focused'}."""
prompt_replace = """Featuring character: ${charDesc}. Expression: ${activePanel.expression || 'focused'}. Equipment/Clothing: ${activePanel.equipment || 'default outfit'}."""
code = code.replace(prompt_search, prompt_replace)

# 5. UI Input Field (Below Facial Expression)
ui_search = """                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                      Facial Expression Anchor
                    </label>
                    <input
                      type="text"
                      value={activePanel.expression}
                      onChange={(e) => handleUpdatePanel(activePanel.id, { expression: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-rose-500"
                    />
                  </div>"""

ui_replace = """                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                      Facial Expression Anchor
                    </label>
                    <input
                      type="text"
                      value={activePanel.expression}
                      onChange={(e) => handleUpdatePanel(activePanel.id, { expression: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-rose-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                      Equipment & Clothing Anchor
                    </label>
                    <input
                      type="text"
                      value={activePanel.equipment || ''}
                      onChange={(e) => handleUpdatePanel(activePanel.id, { equipment: e.target.value })}
                      placeholder="e.g. Glowing neon visor, heavy mech suit..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-rose-500"
                    />
                  </div>"""
code = code.replace(ui_search, ui_replace)

with open('src/components/MangaStudioTab.tsx', 'w') as f:
    f.write(code)

print("Patch applied successfully.")
