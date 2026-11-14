import { useState } from 'react';
import { Geolocation } from '@capacitor/geolocation';
import { useStore, set } from '../lib/store.js';
import { t } from '../lib/i18n.js';
import { CITIES } from '../lib/prayer.js';
import { Btn, Icon, tick } from '../components/ui.jsx';

export default function PlacePicker({ onDone }) {
  const { lang, place } = useStore();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(false);
  const choose = (p) => { tick(); set({ place: p }); onDone?.(); };

  async function locate() {
    setBusy(true); setErr(false);
    try {
      const pos = await Geolocation.getCurrentPosition({ enableHighAccuracy: false, timeout: 10000 });
      const { latitude: lat, longitude: lng } = pos.coords;
      // Nom affiché : la ville de la liste la plus proche si elle est à moins de ~40 km, sinon « Ma position ».
      const near = CITIES.map((c) => ({ c, d: Math.hypot(c.lat - lat, (c.lng - lng) * Math.cos(lat * Math.PI / 180)) })).sort((a, b) => a.d - b.d)[0];
      choose({ name: near.d < 0.36 ? near.c.name : (lang === 'fr' ? 'Ma position' : 'My location'), lat, lng });
    } catch { setErr(true); }
    setBusy(false);
  }

  return (
    <div>
      <Btn className="flex w-full items-center justify-center gap-2" onClick={locate} disabled={busy}>
        <Icon name="pin" size={20} />{busy ? t(lang, 'locating') : t(lang, 'locate')}
      </Btn>
      {err && <p className="mt-3 text-center text-sm text-ember">{t(lang, 'locFail')}</p>}
      <p className="my-4 text-center text-sm text-mute">{t(lang, 'orCity')}</p>
      <div className="grid grid-cols-2 gap-2">
        {CITIES.map((c) => (
          <button key={c.name} onClick={() => choose(c)}
            className={`rounded-2xl border px-3 py-3 text-left text-[15px] font-medium ${place?.name === c.name ? 'border-gold bg-gold/15 text-gold' : 'border-line/60 bg-card/60'}`}>{c.name}</button>
        ))}
      </div>
    </div>
  );
}
