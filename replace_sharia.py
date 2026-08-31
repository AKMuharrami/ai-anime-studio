import os
import re

replacements = [
    (r'Shariah Balance Guard', 'No-Debt Balance Guard'),
    (r'Sharia-compliant modest', 'Modesty-compliant'),
    (r'Shariah Style', 'Modest Style'),
    (r'Shariah Presets', 'Modest Presets'),
    (r'SHARIAH COMPLIANT', 'MODESTY GUIDELINES'),
    (r'sharia-compliant', 'modest'),
    (r'Shariah Guard', 'No-Debt Guard'),
    (r'Shariah-compliant', 'No-Debt'),
    (r'Shariah AI Guardrails', 'Modesty AI Guardrails'),
    (r'Shariah-Compliant', 'No-Debt / Prepaid'),
    (r'Shariah Rule', 'No-Debt Rule'),
    (r'SHARIAH_MODESTY_POSITIVE_INJECTION', 'MODESTY_POSITIVE_INJECTION'),
    (r'shariah_protection_status', 'overdraft_protection_status'),
    (r'Shariah', 'Modest')
]

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    
    new_content = content
    for pattern, repl in replacements:
        new_content = re.sub(pattern, repl, new_content, flags=re.IGNORECASE)
    
    if new_content != content:
        with open(filepath, 'w') as f:
            f.write(new_content)
        print(f"Updated {filepath}")

for root, dirs, files in os.walk('.'):
    if 'node_modules' in root or '.git' in root or 'dist' in root:
        continue
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            process_file(os.path.join(root, file))

