import { useState } from 'react';
import { ImpactStyle, Haptics, NotificationType } from '@capacitor/haptics';
import { useStore, set } from '../lib/store.js';
import { t } from '../lib/i18n.js';
import { DHIKR } from '../lib/dhikr.js';
import { dayKey } from '../lib/prayer.js';
import Noor from '../components/Noor.jsx';
import { tick } from '../components/ui.jsx';

export default function Dhikr() {
  const s = useStore();
  const { lang } = s;
  const d = DHIKR[s.dhikrIdx] || DHIKR[0];
  const [bump, setBump] = useState(0);
  const done = s.dhikrCount >= d.target;
  const pct = Math.min(1, s.dhikrCount / d.target);
  const R = 118, C = 2 * Math.PI * R;

  const count = () => {
    const n = s.dhikrCount + 1;
    if (n === d.target) Haptics.notification({ type: NotificationType.Success }).catch(() => {});
    else tick(ImpactStyle.Medium);
    set({ dhikrCount: n, dhikrDay: dayKey(new Date()), dhikrTotal: s.dhikrTotal + 1 });
    setBump((b) => b + 1);
  };
  const pick = (i) => { tick(); set({ dhikrIdx: i, dhikrCount: 0 }); };

  return (
    <div className="flex flex-col items-center">
      <h1 className="self-start pt-2 text-[26px] font-bold">{t(lang, 'dhikr')}</h1>
      <div className="scroll -mx-5 mt-3 flex w-screen gap-2 overflow-x-auto px-5">
        {DHIKR.map((x, i) => (
          <button key={x.tr} onClick={() => pick(i)}
            className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold ${i === s.dhikrIdx ? 'border-gold bg-gold text-night' : 'border-line/60 bg-card/70 text-mute'}`}>{x.tr}</button>
        ))}
      </div>

      <p className="ar mt-6 text-4xl">{d.ar}</p>
      <p className="mt-1 text-mute">{d[lang]}</p>

      <button onClick={count} aria-label={t(lang, 'tap')} className="relative mt-6 flex h-[270px] w-[270px] items-center justify-center rounded-full active:scale-[.98] transition-transform">
        <svg viewBox="0 0 270 270" className="absolute inset-0 -rotate-90">
          <circle cx="135" cy="135" r={R} fill="rgba(22,54,52,.8)" stroke="#24504c" strokeWidth="14" />
          <circle cx="135" cy="135" r={R} fill="none" stroke={done ? '#4fc3a1' : '#f4bd50'} strokeWidth="14" strokeLinecap="round"
            strokeDasharray={C} strokeDashoffset={C * (1 - pct)} style={{ transition: 'stroke-dashoffset .25s ease' }} />
        </svg>
        <div key={bump} className="pop relative flex flex-col items-center">
          <Noor size={64} mood={done ? 'wow' : 'calm'} still />
          <span className="text-6xl font-bold tabular-nums">{s.dhikrCount}</span>
          <span className="text-sm text-mute">/ {d.target}</span>
        </div>
      </button>

      <p className={`mt-4 text-sm font-semibold ${done ? 'text-leaf' : 'text-mute'}`}>{done ? t(lang, 'done') : t(lang, 'tap')}</p>
      <div className="mt-4 flex items-center gap-4 text-sm text-mute">
        <button onClick={() => { tick(); set({ dhikrCount: 0 }); }} className="rounded-full bg-line/70 px-4 py-2 font-semibold text-cream">{t(lang, 'reset')}</button>
        <span>{s.dhikrTotal} {t(lang, 'total')}</span>
      </div>
    </div>
  );
}
