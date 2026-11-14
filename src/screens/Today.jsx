import { useStore } from '../lib/store.js';
import { t, fmtTime, fmtLeft } from '../lib/i18n.js';
import { currentVerse, verses } from '../lib/verses.js';
import { nextPrayer } from '../lib/prayer.js';
import { hijri, hijriLabel, upcoming } from '../lib/hijri.js';
import useNow from '../lib/useNow.js';
import Noor from '../components/Noor.jsx';
import VerseCard from '../components/VerseCard.jsx';
import { Card, Icon, tick } from '../components/ui.jsx';

export default function Today({ onSettings, goSurah, goTab }) {
  const s = useStore();
  const now = useNow();
  const { lang } = s;
  const v = currentVerse(s.verseEvery, now);
  const next = s.place ? nextPrayer(s.place, s.method, s.madhab, now) : null;
  const h = hijri(now, s.hijriAdjust);
  const event = upcoming(s.hijriAdjust, now)[0];
  const night = now.getHours() >= 22 || now.getHours() < 5;
  const favs = s.favs.map((id) => verses.find((x) => `${x.s}:${x.a}` === id)).filter(Boolean);

  return (
    <div className="flex flex-col gap-4">
      <header className="flex items-start justify-between pt-2">
        <div>
          <p className="text-sm font-semibold text-gold">{t(lang, 'salam')}</p>
          <h1 className="text-[26px] font-bold leading-tight">{hijriLabel(h, lang)}</h1>
          <p className="text-sm text-mute">{now.toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
        </div>
        <button onClick={() => { tick(); onSettings(); }} aria-label={t(lang, 'settings')} className="rounded-full bg-card/80 p-3 text-mute"><Icon name="gear" /></button>
      </header>

      <div className="flex items-center gap-4">
        <Noor size={92} mood={night ? 'sleepy' : 'happy'} />
        <Card className="flex-1 !p-4">
          <p className="text-3xl font-bold text-gold">{s.streak}</p>
          <p className="text-sm text-mute">{s.streak > 1 ? t(lang, 'streak') : t(lang, 'streak1')}</p>
        </Card>
        <Card className="flex-1 !p-4" onClick={() => goTab('dhikr')}>
          <p className="text-3xl font-bold text-leaf">{s.dhikrCount}</p>
          <p className="text-sm text-mute">{t(lang, 'dhikr')}</p>
        </Card>
      </div>

      <VerseCard v={v} label={t(lang, s.verseEvery === 'day' ? 'verseDay' : 'verseHour')} goSurah={goSurah} />

      <Card onClick={() => { tick(); goTab('prayers'); }} className="flex items-center justify-between">
        {next ? (
          <>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-leaf">{t(lang, 'nextPrayer')}</p>
              <p className="mt-1 text-2xl font-bold">{t(lang, next.key)} · {fmtTime(next.at, lang)}</p>
              <p className="text-sm text-mute">{s.place.name}</p>
            </div>
            <p className="rounded-full bg-leaf/15 px-4 py-2 text-sm font-bold text-leaf">{t(lang, 'in')} {fmtLeft(next.at - now)}</p>
          </>
        ) : <p className="text-mute">{t(lang, 'choosePlace')}</p>}
      </Card>

      {event && (
        <Card className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-mute">{t(lang, 'hijri')}</p>
            <p className="mt-1 text-lg font-bold">{event.e[lang]}</p>
          </div>
          <p className="text-sm font-semibold text-gold">{t(lang, 'inDays', event.inDays)}</p>
        </Card>
      )}

      <section>
        <h2 className="mb-2 mt-2 text-lg font-bold">{t(lang, 'favs')}</h2>
        {favs.length === 0 ? <p className="text-sm text-mute">{t(lang, 'noFavs')}</p>
          : <div className="flex flex-col gap-3">{favs.map((f) => <VerseCard key={`${f.s}:${f.a}`} v={f} goSurah={goSurah} />)}</div>}
      </section>
    </div>
  );
}
