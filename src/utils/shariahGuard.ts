export function checkShariahViolation(prompt: string): { isViolation: boolean; reason: string } {
  const lower = (prompt || '').toLowerCase();

  const nudityTerms = ['naked', 'nude', 'boobs', 'breast', 'cleavage', 'topless', 'strip', 'undress', 'bare chest', 'genitals'];
  const sexualizationTerms = ['tight clothes', 'tight fitting', 'form-fitting', 'revealing attire', 'sensual', 'provocative', 'lewd', 'loli', 'lolicon', 'hentai', 'ecchi', 'seductive', 'spread legs', 'erotic'];
  const maleAreaTerms = ['navel exposed', 'shirtless man stomach', 'thong', 'underwear showing'];

  for (const term of nudityTerms) {
    if (lower.includes(term)) {
      if (term === 'breast' && (lower.includes('breastplate') || lower.includes('breastplates'))) {
        continue;
      }
      return { isViolation: true, reason: `Shariah Violation Detected: Nudity concept ("${term}") is prohibited.` };
    }
  }

  for (const term of sexualizationTerms) {
    if (lower.includes(term)) {
      return { isViolation: true, reason: `Shariah Violation Detected: Sexualization or immodest attire ("${term}") is prohibited.` };
    }
  }

  for (const term of maleAreaTerms) {
    if (lower.includes(term)) {
      return { isViolation: true, reason: `Shariah Violation Detected: Inappropriate body exposure ("${term}") violates Shariah modesty guidelines.` };
    }
  }

  return { isViolation: false, reason: '' };
}

export function getShariahStatus(): { warnings: number; isBanned: boolean } {
  const warnings = parseInt(localStorage.getItem('shariah_warnings') || '0', 10);
  const isBanned = localStorage.getItem('shariah_banned') === 'true';
  return { warnings, isBanned };
}

export function recordShariahViolation(reason: string): { warnings: number; isBanned: boolean } {
  let { warnings, isBanned } = getShariahStatus();
  if (isBanned) return { warnings, isBanned: true };

  warnings += 1;
  if (warnings >= 3) {
    isBanned = true;
    localStorage.setItem('shariah_banned', 'true');
  }
  localStorage.setItem('shariah_warnings', warnings.toString());
  return { warnings, isBanned };
}
