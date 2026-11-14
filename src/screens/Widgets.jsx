import { useState } from 'react';
import { useStore, set, refreshActivity } from '../lib/store.js';
import { isNative } from '../lib/native.js';
import { t, fmtTime, fmtLeft } from '../lib/i18n.js';
import { currentVerse } from '../lib/verses.js';
import { nextPrayer, dayTimes, PRAYER_KEYS } from '../lib/prayer.js';
import { hijri, hijriMonth } from '../lib/hijri.js';
import { DHIKR } from '../lib/dhikr.js';
import useNow from '../lib/useNow.js';
import Noor from '../components/Noor.jsx';
import { Card, Toggle } from '../components/ui.jsx';

// Aperçus fidèles aux widgets natifs (ios/App/NoorWidgets).
const Tile = ({ wide, children, className = '' }) => (
  <div className={`relative overflow-hidden rounded-[26px] p-4 shadow-lg shadow-black/30 ${wide ? 'col-span-2 h-[158px]' : 'h-[158px]'} ${className}`}
    style={{ background: 'linear-gradient(160deg,#17403c,#0d2624)' }}>{children}</div>
);
const Label = ({ children }) => <p className="mb-2 mt-5 text-sm font-semibold text-mute">{children}</p>;

export default function Widgets({ goTab }) {
  const s = useStore();
  const { lang } = s;
  const now = useNow();
  const [msg, setMsg] = useState('');
  const v = currentVerse(s.verseEvery, now);
  const place = s.place || { name: 'Paris', lat: 48.8566, lng: 2.3522 };
  const next = nextPrayer(place, s.method, s.madhab, now);
  const times = dayTimes(place, s.method, s.madhab, now);
  const h = hijri(now, s.hijriAdjust);
  const d = DHIKR[s.dhikrIdx] || DHIKR[0];

  async function toggleIsland(on) {
    setMsg('');
    if (on && !isNative) return setMsg(t(lang, 'islandWeb'));
    if (on && !s.place) return setMsg(t(lang, 'islandNeedPlace'));
    set({ liveActivity: on });
    const r = await refreshActivity();
    if (on && !r?.ok) { set({ liveActivity: false }); setMsg(t(lang, 'islandOff')); }
  }

  return (
    <div>
      <h1 className="pt-2 text-[26px] font-bold">{t(lang, 'wTitle')}</h1>
      <p className="text-sm text-mute">{t(lang, 'wSub')}</p>

      <Card className="mt-4">
        <div className="flex items-center justify-between gap-4">
          <div><p className="font-bold">{t(lang, 'island')}</p><p className="mt-1 text-sm text-mute">{t(lang, 'islandSub')}</p></div>
          <Toggle on={s.liveActivity} onChange={toggleIsland} />
        </div>
        <div className="mx-auto mt-4 flex h-11 w-full max-w-[320px] items-center justify-between rounded-full bg-black px-3">
          <span className="flex items-center gap-2 text-sm font-semibold text-gold"><Noor size={22} still />{next ? t(lang, next.key) : 'Maghrib'}</span>
          <span className="text-sm font-bold tabular-nums text-gold">{next ? fmtLeft(next.at - now) : '12 min'}</span>
        </div>
        {msg && <p className="mt-3 text-sm text-ember">{msg}</p>}
      </Card>

      <Label>{t(lang, 'wVerse')}</Label>
      <div className="grid grid-cols-2 gap-3">
        <Tile wide>
          <div className="flex h-full flex-col justify-between">
            <p className="ar line-clamp-2 text-[19px]" style={{ lineHeight: 1.8 }}>{v.ar}</p>
            <p className="line-clamp-2 text-[13px] leading-snug text-cream/85">{v[lang]}</p>
            <div className="flex items-center justify-between"><span className="text-[11px] font-semibold text-gold">{v.name} {v.s}:{v.a}</span><Noor size={20} still /></div>
          </div>
        </Tile>
      </div>

      <Label>{t(lang, 'wPrayer')} · {t(lang, 'wHijri')}</Label>
      <div className="grid grid-cols-2 gap-3">
        <Tile>
          <div className="flex h-full flex-col justify-between">
            <div className="flex items-start justify-between"><p className="text-[11px] font-bold uppercase tracking-wider text-leaf">{t(lang, 'nextPrayer')}</p><Noor size={24} mood="calm" still /></div>
            <div>
              <p className="text-2xl font-bold">{next ? t(lang, next.key) : '—'}</p>
              <p className="text-xl font-bold tabular-nums text-gold">{next ? fmtTime(next.at, lang) : ''}</p>
              <p className="text-[12px] text-mute">{next ? `${t(lang, 'in')} ${fmtLeft(next.at - now)}` : ''}</p>
            </div>
          </div>
        </Tile>
        <Tile>
          <div className="flex h-full flex-col items-center justify-center text-center">
            <p className="text-5xl font-bold text-gold">{h.day}</p>
            <p className="mt-1 font-semibold">{hijriMonth(h.month, lang)}</p>
            <p className="text-sm text-mute">{h.year}</p>
          </div>
        </Tile>
      </div>

      <Label>{t(lang, 'wPrayers')}</Label>
      <div className="grid grid-cols-2 gap-3">
        <Tile wide>
          <div className="flex h-full flex-col justify-between">
            <div className="flex items-center justify-between"><p className="text-sm font-bold">{place.name}</p><Noor size={22} still /></div>
            <div className="flex justify-between">
              {PRAYER_KEYS.filter((k) => k !== 'sunrise').map((k) => {
                const i = PRAYER_KEYS.indexOf(k); const on = next?.key === k;
                return (
                  <div key={k} className={`flex flex-col items-center rounded-2xl px-2 py-2 ${on ? 'bg-gold text-night' : ''}`}>
                    <span className={`text-[11px] font-semibold ${on ? '' : 'text-mute'}`}>{t(lang, k)}</span>
                    <span className="mt-1 text-[14px] font-bold tabular-nums">{fmtTime(times[i], lang).replace(/\s?[AP]M/, '')}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </Tile>
      </div>

      <Label>{t(lang, 'wDhikr')}</Label>
      <div className="grid grid-cols-2 gap-3">
        <Tile>
          <button className="flex h-full w-full flex-col items-center justify-between" onClick={() => goTab('dhikr')}>
            <p className="ar text-lg" style={{ lineHeight: 1.5 }}>{d.ar}</p>
            <p className="text-4xl font-bold tabular-nums">{s.dhikrCount}<span className="text-base text-mute"> / {d.target}</span></p>
            <span className="rounded-full bg-gold px-5 py-1 text-sm font-bold text-night">+1</span>
          </button>
        </Tile>
        <div className="flex h-[158px] flex-col justify-center gap-2 rounded-[26px] border border-line/60 p-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-mute">{t(lang, 'wLock')}</p>
          <p className="text-sm font-semibold">☾ {next ? `${t(lang, next.key)} ${fmtTime(next.at, lang)}` : ''}</p>
          <p className="line-clamp-3 text-[12px] leading-snug text-cream/80">{v[lang]}</p>
        </div>
      </div>

      <Card className="mt-6">
        <p className="font-bold">{t(lang, 'how')}</p>
        <ol className="mt-2 flex flex-col gap-2 text-sm text-cream/85">
          {['how1', 'how2', 'how3'].map((k, i) => (
            <li key={k} className="flex gap-3"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gold text-xs font-bold text-night">{i + 1}</span>{t(lang, k)}</li>
          ))}
        </ol>
      </Card>
    </div>
  );
}
