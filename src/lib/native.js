// Pont vers iOS (App Group partagé avec les widgets + Live Activity).
// Dans un navigateur, tout retombe sur localStorage pour que l'app reste utilisable.
import { Capacitor, registerPlugin } from '@capacitor/core';

const Bridge = registerPlugin('NoorBridge');
export const isNative = Capacitor.isNativePlatform();

export async function pushShared(items) {
  const flat = Object.fromEntries(Object.entries(items).map(([k, v]) => [k, typeof v === 'string' ? v : JSON.stringify(v)]));
  if (!isNative) return;
  try { await Bridge.setItems({ items: flat }); } catch (e) { console.warn('NoorBridge.setItems', e); }
}

export async function readShared(keys) {
  if (!isNative) return {};
  try { return (await Bridge.getItems({ keys })).items || {}; } catch { return {}; }
}

export async function startPrayerActivity(payload) {
  if (!isNative) return { ok: false, reason: 'web' };
  try { return await Bridge.startPrayerActivity(payload); } catch (e) { return { ok: false, reason: String(e?.message || e) }; }
}

export async function endPrayerActivity() {
  if (!isNative) return;
  try { await Bridge.endPrayerActivity(); } catch { /* rien à arrêter */ }
}
