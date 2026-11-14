import { useState } from 'react';
import { useStore, set } from '../lib/store.js';
import { t } from '../lib/i18n.js';
import { METHODS } from '../lib/prayer.js';
import { hijri, hijriLabel, upcoming } from '../lib/hijri.js';
import { Card, Seg, Icon, tick } from '../components/ui.jsx';
import PlacePicker from './PlacePicker.jsx';

const Row = ({ title, children }) => <div className="flex flex-col gap-2"><p className="text-sm font-semibold text-mute">{title}</p>{children}</div>;

export default function Settings({ onClose }) {
  const s = useStore();
  const { lang } = s;
  const [picking, setPicking] = useState(false);
  const events = upcoming(s.hijriAdjust);
  return (
    <div className="sky fixed inset-0 z-20 flex flex-col">
      <header className="safe-top flex items-center justify-between px-5 pb-3">
        <h1 className="text-[26px] font-bold">{picking ? t(lang, 'place') : t(lang, 'settings')}</h1>
        <button onClick={() => { tick(); picking ? setPicking(false) : onClose(); }} aria-label={t(lang, 'back')} className="rounded-full bg-card/80 p-3 text-mute"><Icon name="close" /></button>
      </header>
      <div className="scroll safe-bottom flex flex-1 flex-col gap-5 px-5">
        {picking ? <PlacePicker onDone={() => setPicking(false)} /> : (
          <>
            <Row title={t(lang, 'language')}><Seg value={lang} onChange={(v) => set({ lang: v })} options={[['fr', 'Français'], ['en', 'English']]} /></Row>
            <Row title={t(lang, 'verseRhythm')}><Seg value={s.verseEvery} onChange={(v) => set({ verseEvery: v })} options={[['hour', t(lang, 'everyHour')], ['day', t(lang, 'everyDay')]]} /></Row>
            <Row title={t(lang, 'place')}>
              <button onClick={() => { tick(); setPicking(true); }} className="flex items-center justify-between rounded-2xl border border-line/60 bg-card/70 px-4 py-3 text-left">
                <span className="font-semibold">{s.place?.name || '—'}</span><span className="text-sm font-semibold text-gold">{t(lang, 'change')}</span>
              </button>
            </Row>
            <Row title={t(lang, 'method')}>
              <div className="flex flex-col gap-2">
                {METHODS.map((m) => (
                  <button key={m.id} onClick={() => { tick(); set({ method: m.id }); }}
                    className={`rounded-2xl border px-4 py-3 text-left text-[15px] font-medium ${s.method === m.id ? 'border-gold bg-gold/15 text-gold' : 'border-line/60 bg-card/60'}`}>{m[lang]}</button>
                ))}
              </div>
            </Row>
            <Row title={t(lang, 'asrRule')}><Seg value={s.madhab} onChange={(v) => set({ madhab: v })} options={[['shafi', t(lang, 'shafi')], ['hanafi', t(lang, 'hanafi')]]} /></Row>
            <Row title={`${t(lang, 'hijriAdj')} · ${hijriLabel(hijri(new Date(), s.hijriAdjust), lang)}`}>
              <Seg value={s.hijriAdjust} onChange={(v) => set({ hijriAdjust: v })} options={[-2, -1, 0, 1, 2].map((n) => [n, `${n > 0 ? '+' : ''}${n} ${t(lang, 'days')}`])} />
            </Row>
            <Card>
              <p className="font-bold">{t(lang, 'upcoming')}</p>
              <div className="mt-2 flex flex-col gap-2">
                {events.map(({ e, date, inDays }) => (
                  <div key={e.en} className="flex items-center justify-between text-sm">
                    <span className="font-semibold">{e[lang]}</span>
                    <span className="text-mute">{date.toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' })} · {t(lang, 'inDays', inDays)}</span>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-xs text-mute">{t(lang, 'approx')}</p>
            </Card>
            <Card className="mb-6"><p className="font-bold">{t(lang, 'credits')}</p><p className="mt-2 text-xs leading-relaxed text-mute">{t(lang, 'creditsText')}</p></Card>
          </>
        )}
      </div>
    </div>
  );
}
