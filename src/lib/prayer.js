import { Coordinates, CalculationMethod, PrayerTimes, Madhab } from 'adhan';

export const METHODS = [
  { id: 'france12', fr: 'France — 12° (UOIF)', en: 'France — 12° (UOIF)' },
  { id: 'mwl', fr: 'Ligue islamique mondiale', en: 'Muslim World League' },
  { id: 'isna', fr: 'Amérique du Nord (ISNA)', en: 'North America (ISNA)' },
  { id: 'egypt', fr: 'Égypte', en: 'Egyptian Authority' },
  { id: 'makkah', fr: 'Umm al-Qura (La Mecque)', en: 'Umm al-Qura (Makkah)' },
  { id: 'moonsighting', fr: 'Moonsighting Committee', en: 'Moonsighting Committee' },
  { id: 'turkey', fr: 'Turquie (Diyanet)', en: 'Turkey (Diyanet)' },
];

function params(method, madhab) {
  let p;
  switch (method) {
    case 'france12': p = CalculationMethod.Other(); p.fajrAngle = 12; p.ishaAngle = 12; break;
    case 'isna': p = CalculationMethod.NorthAmerica(); break;
    case 'egypt': p = CalculationMethod.Egyptian(); break;
    case 'makkah': p = CalculationMethod.UmmAlQura(); break;
    case 'moonsighting': p = CalculationMethod.MoonsightingCommittee(); break;
    case 'turkey': p = CalculationMethod.Turkey(); break;
    default: p = CalculationMethod.MuslimWorldLeague();
  }
  p.madhab = madhab === 'hanafi' ? Madhab.Hanafi : Madhab.Shafi;
  return p;
}

export const PRAYER_KEYS = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];

export function dayTimes(place, method, madhab, date) {
  const pt = new PrayerTimes(new Coordinates(place.lat, place.lng), date, params(method, madhab));
  return PRAYER_KEYS.map((k) => pt[k]);
}

const pad = (n) => String(n).padStart(2, '0');
export const dayKey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

// Planning envoyé aux widgets : 30 jours d'horaires en secondes Unix.
export function schedule(place, method, madhab, days = 30) {
  const out = [];
  const start = new Date(); start.setHours(12, 0, 0, 0);
  for (let i = -1; i < days; i++) {
    const d = new Date(start); d.setDate(start.getDate() + i);
    out.push({ d: dayKey(d), t: dayTimes(place, method, madhab, d).map((x) => Math.round(x.getTime() / 1000)) });
  }
  return { city: place.name, days: out };
}

// Prochaine prière (le lever du soleil n'est pas une prière : on le saute).
export function nextPrayer(place, method, madhab, now = new Date()) {
  for (let i = 0; i < 2; i++) {
    const d = new Date(now); d.setDate(now.getDate() + i);
    const times = dayTimes(place, method, madhab, d);
    for (let k = 0; k < times.length; k++) {
      if (k !== 1 && times[k] > now) return { key: PRAYER_KEYS[k], at: times[k] };
    }
  }
  return null;
}

export const CITIES = [
  ['Paris', 48.8566, 2.3522], ['Lyon', 45.764, 4.8357], ['Marseille', 43.2965, 5.3698], ['Lille', 50.6292, 3.0573],
  ['Toulouse', 43.6047, 1.4442], ['Strasbourg', 48.5734, 7.7521], ['Bruxelles', 50.8503, 4.3517], ['Genève', 46.2044, 6.1432],
  ['Montréal', 45.5019, -73.5674], ['Casablanca', 33.5731, -7.5898], ['Alger', 36.7538, 3.0588], ['Tunis', 36.8065, 10.1815],
  ['Dakar', 14.7167, -17.4677], ['Abidjan', 5.36, -4.0083], ['Bamako', 12.6392, -8.0029], ['London', 51.5074, -0.1278],
  ['Berlin', 52.52, 13.405], ['Amsterdam', 52.3676, 4.9041], ['Istanbul', 41.0082, 28.9784], ['Cairo', 30.0444, 31.2357],
  ['Makkah', 21.4225, 39.8262], ['Madinah', 24.4672, 39.6111], ['Dubai', 25.2048, 55.2708], ['New York', 40.7128, -74.006],
  ['Chicago', 41.8781, -87.6298], ['Houston', 29.7604, -95.3698], ['Los Angeles', 34.0522, -118.2437], ['Toronto', 43.6532, -79.3832],
  ['Jakarta', -6.2088, 106.8456], ['Kuala Lumpur', 3.139, 101.6869],
].map(([name, lat, lng]) => ({ name, lat, lng }));
