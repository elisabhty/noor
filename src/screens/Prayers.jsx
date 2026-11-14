import { useState } from 'react';
import { useStore } from '../lib/store.js';
import { t, fmtTime, fmtLeft } from '../lib/i18n.js';
import { dayTimes, nextPrayer, PRAYER_KEYS } from '../lib/prayer.js';
import useNow from '../lib/useNow.js';
import Noor from '../components/Noor.jsx';
import { Card, Icon, tick } from '../components/ui.jsx';
import PlacePicker from './PlacePicker.jsx';

export default function Prayers() {
  const s = useStore();
  const now = useNow(15000);
  const [picking, setPicking] = useState(false);
  const { lang } = s;

  if (!s.place || picking) {
    return (
      <div>
        <div className="flex items-center gap-4 pt-2">
          <Noor size={60} mood="wow" still />
          <div><h1 className="text-[26px] font-bold">{t(lang, 'prayers')}</h1><p className="text-sm text-mute">{t(lang, 'choosePlace')}</p></div>
        </div>
        <div className="mt-5"><PlacePicker onDone={() => setPicking(false)} /></div>
      </div>
    );
  }

  const times = dayTimes(s.place, s.method, s.madhab, now);
  const next = nextPrayer(s.place, s.method, s.madhab, now);
  const nextToday = next && times.some((x) => x.getTime() === next.at.getTime());
  return (
    <div className="flex flex-col gap-4">
      <header className="flex items-end justify-between pt-2">
        <h1 className="text-[26px] font-bold">{t(lang, 'prayers')}</h1>
        <button onClick={() => { tick(); setPicking(true); }} className="flex items-center gap-1 rounded-full bg-card/80 px-3 py-2 text-sm font-semibold text-gold">
          <Icon name="pin" size={16} />{s.place.name}
        </button>
      </header>

      {next && (
        <Card className="rise flex items-center gap-4 !bg-leaf/15 !border-leaf/40">
          <Noor size={70} mood="calm" />
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-leaf">{t(lang, 'nextPrayer')}</p>
            <p className="text-3xl font-bold">{t(lang, next.key)}</p>
            <p className="text-mute">{fmtTime(next.at, lang)} · {t(lang, 'in')} {fmtLeft(next.at - now)}</p>
          </div>
        </Card>
      )}

      <Card className="!p-2">
        {PRAYER_KEYS.map((k, i) => {
          const isNext = nextToday && next.key === k;
          const past = times[i] < now;
          return (
            <div key={k} className={`flex items-center justify-between rounded-2xl px-4 py-3.5 ${isNext ? 'bg-gold text-night' : ''}`}>
              <span className={`text-[17px] font-semibold ${!isNext && (past || i === 1) ? 'text-mute' : ''}`}>{t(lang, k)}</span>
              <span className={`text-[17px] font-bold tabular-nums ${!isNext && past ? 'text-mute' : ''}`}>{fmtTime(times[i], lang)}</span>
            </div>
          );
        })}
      </Card>
    </div>
  );
}
