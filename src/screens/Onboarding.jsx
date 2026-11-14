import { useEffect, useState } from 'react';
import { useStore, set } from '../lib/store.js';
import { t } from '../lib/i18n.js';
import { REASONS, journey, verseOf } from '../lib/journey.js';
import { dayKey } from '../lib/prayer.js';
import { scheduleDaily } from '../lib/notify.js';
import Noor from '../components/Noor.jsx';
import JourneyPath from '../components/JourneyPath.jsx';
import { Btn, Seg, Option, Icon, tick } from '../components/ui.jsx';
import PlacePicker from './PlacePicker.jsx';
import Paywall from './Paywall.jsx';

const QUESTIONS = 9; // étapes 1 à 9 : la barre de progression

export default function Onboarding() {
  const s = useStore();
  const { lang } = s;
  const [step, setStep] = useState(0);
  const next = () => setStep((n) => n + 1);
  const back = () => { tick(); setStep((n) => Math.max(0, n - 1)); };
  const finish = () => set({ onboarded: true, journeyStart: dayKey(new Date()), journeyDone: [] });

  // Étape 10 : courte préparation, puis le plan s'affiche.
  useEffect(() => { if (step === 10) { const id = setTimeout(next, 2600); return () => clearTimeout(id); } }, [step]);

  if (step === 12) return <Paywall onDone={finish} />;

  const Head = ({ title, sub }) => (
    <div className="rise pb-5 text-center">
      <h1 className="text-[27px] font-bold leading-tight">{title}</h1>
      {sub && <p className="mt-2 text-mute">{sub}</p>}
    </div>
  );
  const single = (key, value) => { set({ [key]: value }); };
  const verse = verseOf('20:2');
  const plan = journey(s.reason);

  let body, cta, canGo = true, ghost;
  switch (step) {
    case 0:
      body = (
        <div className="rise flex flex-1 flex-col items-center justify-center text-center">
          <Noor size={170} mood="happy" />
          <p className="mt-8 text-sm font-semibold tracking-wide text-gold">{t(lang, 'salam')}</p>
          <h1 className="mt-2 text-3xl font-bold">{t(lang, 'ob1')}</h1>
          <p className="mt-3 max-w-xs text-mute">{t(lang, 'ob1s')}</p>
          <div className="mt-8 w-56"><Seg value={lang} onChange={(v) => set({ lang: v })} options={[['fr', 'Français'], ['en', 'English']]} /></div>
        </div>
      );
      cta = t(lang, 'start'); break;
    case 1:
      body = (<>
        <Head title={t(lang, 'obName')} sub={t(lang, 'obNameSub')} />
        <input value={s.name} onChange={(e) => set({ name: e.target.value.slice(0, 24) })} placeholder={t(lang, 'obNamePh')} autoCapitalize="words"
          className="w-full rounded-3xl border border-line/60 bg-card/70 px-5 py-4 text-center text-xl text-cream placeholder:text-mute outline-none focus:border-gold" style={{ userSelect: 'text' }} />
      </>);
      ghost = s.name.trim() ? null : t(lang, 'skip'); canGo = !!s.name.trim(); break;
    case 2:
      body = (<>
        <Head title={t(lang, 'obReason')} />
        <p className="-mt-2 mb-5 text-center text-[15px] font-medium leading-relaxed text-cream/80">« {verse[lang]} »<span className="mt-1 block text-sm text-mute">{verse.name} 20:2</span></p>
        <div className="flex flex-col gap-3">{Object.entries(REASONS).map(([k, r]) => <Option key={k} icon={r.icon} on={s.reason === k} onClick={() => single('reason', k)}>{r[lang]}</Option>)}</div>
      </>);
      canGo = !!s.reason; break;
    case 3:
      body = (<>
        <Head title={t(lang, 'obSince')} sub={t(lang, 'obSinceSub')} />
        <div className="flex flex-col gap-3">{[1, 2, 3, 4, 5].map((n) => <Option key={n} on={s.since === `since${n}`} onClick={() => single('since', `since${n}`)}>{t(lang, `since${n}`)}</Option>)}</div>
      </>);
      canGo = !!s.since; break;
    case 4:
      body = (<>
        <Head title={t(lang, 'obLevel')} sub={t(lang, 'obLevelSub')} />
        <div className="flex flex-col gap-3">{[1, 2, 3].map((n) => <Option key={n} on={s.level === `level${n}`} onClick={() => single('level', `level${n}`)}>{t(lang, `level${n}`)}</Option>)}</div>
      </>);
      canGo = !!s.level; break;
    case 5:
      body = (
        <div className="rise flex flex-1 flex-col items-center justify-center text-center">
          <Noor size={140} mood="calm" />
          <h1 className="mt-8 text-[27px] font-bold leading-tight">{t(lang, 'obCheer', s.name.trim())}</h1>
          <p className="mt-3 max-w-xs text-mute">{t(lang, 'obCheerSub')}</p>
        </div>
      ); break;
    case 6: {
      const toggle = (k) => set({ wants: s.wants.includes(k) ? s.wants.filter((x) => x !== k) : s.wants.length < 3 ? [...s.wants, k] : s.wants });
      body = (<>
        <Head title={t(lang, 'obWants')} />
        <p className="-mt-2 mb-4 text-center text-sm font-bold text-gold">{t(lang, 'picked', s.wants.length)}</p>
        <div className="flex flex-col gap-3">{[1, 2, 3, 4, 5, 6].map((n) => <Option key={n} on={s.wants.includes(`want${n}`)} onClick={() => toggle(`want${n}`)}>{t(lang, `want${n}`)}</Option>)}</div>
      </>);
      canGo = s.wants.length > 0; break;
    }
    case 7:
      body = (<>
        <Head title={t(lang, 'obMoment')} sub={t(lang, 'obMomentSub')} />
        <div className="flex flex-col gap-3">{['morning', 'noon', 'evening'].map((k) => <Option key={k} on={s.moment === k} onClick={() => single('moment', k)}>{t(lang, k)}</Option>)}</div>
        <div className="mt-8 rounded-3xl border border-line/60 bg-card/70 p-5 text-center">
          <Icon name="prayers" className="mx-auto text-gold" size={30} />
          <p className="mt-2 font-bold">{t(lang, 'obNotif')}</p><p className="mt-1 text-sm text-mute">{t(lang, 'obNotifSub')}</p>
          <button onClick={async () => { tick(); set({ notif: await scheduleDaily(s.moment, t(lang, 'notifBody')) }); }}
            className={`mt-4 rounded-full px-5 py-2.5 text-sm font-bold ${s.notif ? 'bg-leaf text-night' : 'bg-line/80'}`}>{s.notif ? '✓ ' : ''}{t(lang, 'allow')}</button>
        </div>
      </>); break;
    case 8:
      body = (<>
        <Head title={t(lang, 'ob2')} sub={t(lang, 'ob2s')} />
        <PlacePicker onDone={next} />
      </>);
      cta = null; ghost = s.place ? t(lang, 'next') : t(lang, 'later'); break;
    case 9:
      body = (<>
        <Head title={t(lang, 'obIntent', s.name.trim())} sub={t(lang, 'obIntentSub')} />
        <textarea value={s.intention} onChange={(e) => set({ intention: e.target.value.slice(0, 200) })} placeholder={t(lang, 'obIntentPh')} rows={4}
          className="w-full resize-none rounded-3xl border border-line/60 bg-card/70 px-5 py-4 text-[17px] text-cream placeholder:text-mute outline-none focus:border-gold" style={{ userSelect: 'text' }} />
      </>);
      cta = t(lang, 'makePlan'); break;
    case 10:
      body = (
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <Noor size={130} mood="wow" />
          <h1 className="mt-8 text-[26px] font-bold">{t(lang, 'building')}</h1>
          <div className="mt-6 flex w-full max-w-xs flex-col gap-3 text-left">
            {['build1', 'build2', 'build3'].map((k, i) => (
              <div key={k} className="rise flex items-center gap-3" style={{ animationDelay: `${i * 700}ms` }}>
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-leaf text-xs text-night">✓</span>{t(lang, k)}
              </div>
            ))}
          </div>
        </div>
      );
      cta = null; break;
    default:
      body = (<>
        <div className="flex flex-col items-center text-center">
          <Noor size={80} mood="happy" />
          <h1 className="mt-3 text-[27px] font-bold leading-tight">{plan.title[lang]}</h1>
          <div className="mt-4 flex w-full items-center justify-center gap-5 rounded-3xl border border-line/60 bg-card/70 py-3 font-semibold">
            <span>{t(lang, 'sessions')}</span><span className="h-5 w-px bg-line" /><span>{t(lang, 'perDay')}</span>
          </div>
        </div>
        <div className="mt-5 pb-4"><JourneyPath plan={plan} lang={lang} /></div>
      </>);
      cta = t(lang, 'startJourney');
  }

  return (
    <div className="sky safe-top safe-bottom flex h-full flex-col px-6">
      {step >= 1 && step <= QUESTIONS && (
        <div className="flex items-center gap-3 pb-6 pt-1">
          <button onClick={back} aria-label={t(lang, 'back')} className="text-mute"><Icon name="back" size={22} /></button>
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-line/60"><div className="h-full rounded-full bg-gold transition-all duration-300" style={{ width: `${(step / QUESTIONS) * 100}%` }} /></div>
        </div>
      )}
      <div key={step} className="scroll flex flex-1 flex-col">{body}</div>
      <div className="flex flex-col gap-1 pb-2 pt-3">
        {cta !== null && <Btn disabled={!canGo} className={canGo ? '' : 'opacity-40'} onClick={() => { tick(); next(); }}>{cta || t(lang, 'next')}</Btn>}
        {ghost && <Btn kind="ghost" onClick={() => { tick(); next(); }}>{ghost}</Btn>}
      </div>
    </div>
  );
}
