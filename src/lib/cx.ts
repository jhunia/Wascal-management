/** Joins CSS class names, skipping empty ones: cx('a', isOn && 'b') → "a b" */
export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

/** 1250000 → "€1.25M", 82000 → "€82k" */
export function money(eur: number): string {
  if (eur >= 1_000_000) return `€${(eur / 1_000_000).toFixed(2).replace(/\.?0+$/, '')}M`;
  if (eur >= 1_000) return `€${Math.round(eur / 1_000)}k`;
  return `€${eur}`;
}

/** "Kofi Mensah" → "KM" */
export function initials(name: string): string {
  return name
    .replace(/^(Dr\.?|Prof\.?)\s+/i, '')
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}
