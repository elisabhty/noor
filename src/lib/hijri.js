const MONTHS = {
  fr: ['Mouharram', 'Safar', 'Rabi al-Awwal', 'Rabi ath-Thani', 'Joumada al-Oula', 'Joumada ath-Thania', 'Rajab', 'Chaabane', 'Ramadan', 'Chawwal', 'Dhou al-Qida', 'Dhou al-Hijja'],
  en: ['Muharram', 'Safar', 'Rabi al-Awwal', 'Rabi al-Thani', 'Jumada al-Ula', 'Jumada al-Thani', 'Rajab', 'Shaban', 'Ramadan', 'Shawwal', 'Dhu al-Qadah', 'Dhu al-Hijjah'],
};
const fmt = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura-nu-latn', { day: 'numeric', month: 'numeric', year: 'numeric' });

// Calendrier Umm al-Qura. `adjust` (jours) permet de suivre l'annonce locale de la lune.
export function hijri(date = new Date(), adjust = 0) {
  const d = new Date(date); d.setDate(d.getDate() + adjust);
  const p = Object.fromEntries(fmt.formatToParts(d).map((x) => [x.type, x.value]));
  return { day: +p.day, month: +p.month, year: parseInt(p.year, 10) };
}
export const hijriLabel = (h, lang) => `${h.day} ${MONTHS[lang][h.month - 1]} ${h.year}`;
export const hijriMonth = (m, lang) => MONTHS[lang][m - 1];

// Repères de l'année (jour, mois hégirien).
export const EVENTS = [
  { m: 1, d: 1, fr: 'Nouvel an hégirien', en: 'Islamic New Year' },
  { m: 1, d: 10, fr: 'Achoura', en: 'Ashura' },
  { m: 9, d: 1, fr: 'Début du Ramadan', en: 'Start of Ramadan' },
  { m: 10, d: 1, fr: 'Aïd al-Fitr', en: 'Eid al-Fitr' },
  { m: 12, d: 9, fr: 'Jour d’Arafat', en: 'Day of Arafah' },
  { m: 12, d: 10, fr: 'Aïd al-Adha', en: 'Eid al-Adha' },
];

// Prochains repères, avec leur date grégorienne estimée (cherchée jour par jour sur 400 jours).
export function upcoming(adjust = 0, from = new Date()) {
  const out = [];
  for (let i = 0; i < 400 && out.length < EVENTS.length; i++) {
    const d = new Date(from); d.setHours(12, 0, 0, 0); d.setDate(d.getDate() + i);
    const h = hijri(d, adjust);
    const e = EVENTS.find((x) => x.m === h.month && x.d === h.day);
    if (e && !out.some((o) => o.e === e)) out.push({ e, date: d, inDays: i });
  }
  return out;
}
