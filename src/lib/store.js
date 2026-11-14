import { useSyncExternalStore } from 'react';
import { pushShared, readShared, startPrayerActivity, endPrayerActivity } from './native.js';
import { schedule, nextPrayer, dayKey } from './prayer.js';
import { t } from './i18n.js';

const KEY = 'noor.v1';
const sysLang = (navigator.language || 'fr').toLowerCase().startsWith('fr') ? 'fr' : 'en';
const defaults = {
  onboarded: false, lang: sysLang, verseEvery: 'hour', place: null,
  method: sysLang === 'fr' ? 'france12' : 'mwl', madhab: 'shafi', hijriAdjust: 0,
  dhikrIdx: 0, dhikrCount: 0, dhikrDay: '', dhikrTotal: 0,
  streak: 0, lastOpen: '', liveActivity: false, favs: [],
};

let state = { ...defaults, ...safeParse(localStorage.getItem(KEY)) };
const subs = new Set();
function safeParse(s) { try { return JSON.parse(s) || {}; } catch { return {}; } }

export const get = () => state;
export function set(patch) {
  state = { ...state, ...(typeof patch === 'function' ? patch(state) : patch) };
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* stockage plein ou privé */ }
  subs.forEach((f) => f());
  queueSync();
}
export const useStore = () => useSyncExternalStore((f) => (subs.add(f), () => subs.delete(f)), get);

let timer;
function queueSync() { clearTimeout(timer); timer = setTimeout(syncNative, 150); }

export async function syncNative() {
  const s = state;
  await pushShared({
    lang: s.lang, verseEvery: s.verseEvery, hijriAdjust: String(s.hijriAdjust), streak: String(s.streak),
    dhikrIdx: String(s.dhikrIdx), dhikrCount: String(s.dhikrCount), dhikrDay: s.dhikrDay,
    prayers: s.place ? schedule(s.place, s.method, s.madhab) : '',
  });
}

export async function refreshActivity() {
  const s = state;
  if (!s.liveActivity || !s.place) { await endPrayerActivity(); return { ok: false }; }
  const n = nextPrayer(s.place, s.method, s.madhab);
  if (!n) return { ok: false };
  return startPrayerActivity({ name: t(s.lang, n.key), at: Math.round(n.at.getTime() / 1000), city: s.place.name, lang: s.lang });
}

// À chaque ouverture / retour dans l'app : série de jours, remise à zéro du dhikr, lecture du compteur du widget.
export async function onOpen() {
  const today = dayKey(new Date());
  const y = new Date(); y.setDate(y.getDate() - 1);
  const patch = {};
  if (state.lastOpen !== today) {
    patch.streak = state.lastOpen === dayKey(y) ? state.streak + 1 : 1;
    patch.lastOpen = today;
  }
  const shared = await readShared(['dhikrCount', 'dhikrDay', 'dhikrIdx']);
  let count = state.dhikrCount, day = state.dhikrDay;
  if (shared.dhikrDay === today && Number(shared.dhikrCount) > (day === today ? count : 0)) {
    patch.dhikrTotal = state.dhikrTotal + (Number(shared.dhikrCount) - (day === today ? count : 0));
    count = Number(shared.dhikrCount); day = today;
  }
  if (day !== today) { count = 0; day = today; }
  set({ ...patch, dhikrCount: count, dhikrDay: day });
  await syncNative();
  await refreshActivity();
}
