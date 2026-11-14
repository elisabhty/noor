import verses from '../data/verses.json';

export { verses };

// Même formule que dans le widget Swift (NoorShared.swift) : l'app et le widget montrent le même verset.
export function verseIndex(date, every) {
  const t = Math.floor(date.getTime() / 1000);
  const slot = every === 'day'
    ? Math.floor((t - date.getTimezoneOffset() * 60) / 86400)
    : Math.floor(t / 3600);
  return ((slot * 37 + 11) % verses.length + verses.length) % verses.length;
}

export const currentVerse = (every, date = new Date()) => verses[verseIndex(date, every)];
