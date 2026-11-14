import { useState } from 'react';
import { useStore, set } from '../lib/store.js';
import { t } from '../lib/i18n.js';
import { journey, unlockedDays, REASONS } from '../lib/journey.js';
import { dayKey } from '../lib/prayer.js';
import Noor from '../components/Noor.jsx';
import JourneyPath from '../components/JourneyPath.jsx';
import VerseCard from '../components/VerseCard.jsx';
import { Btn, Card, Icon, Option, tick } from '../components/ui.jsx';

export default function Journey({ onClose, goSurah }) {
  const s = useStore();
  const { lang } = s;
  const plan = journey(s.reason);
  const open = unlockedDays(s.journeyStart);
  const firstTodo = plan.days.findIndex((_, i) => i < open && !s.journeyDone.includes(i));
  const [sel, setSel] = useState(firstTodo === -1 ? open - 1 : firstTodo);
  const [choosing, setChoosing] = useState(false);
  const finished = s.journeyDone.length >= 7;
  const day = plan.days[sel];
  const done = s.journeyDone.includes(sel);
  const state = (i) => (s.journeyDone.includes(i) ? 'done' : i < open ? 'open' : 'locked');

  return (
    <div className="sky fixed inset-0 z-20 flex flex-col">
      <header className="safe-top flex items-center justify-between px-5 pb-3">
        <div><p className="text-xs font-bold uppercase tracking-widest text-gold">{t(lang, 'journeyCard')}</p><h1 className="text-[24px] font-bold leading-tight">{plan.title[lang]}</h1></div>
        <button onClick={() => { tick(); onClose(); }} aria-label={t(lang, 'back')} className="rounded-full bg-card/80 p-3 text-mute"><Icon name="close" /></button>
      </header>
      <div className="scroll safe-bottom flex flex-1 flex-col gap-4 px-5">
        {choosing ? (
          <div className="flex flex-col gap-3">
            {Object.entries(REASONS).map(([k, r]) => (
              <Option key={k} icon={r.icon} on={s.reason === k}
                onClick={() => { set({ reason: k, journeyStart: dayKey(new Date()), journeyDone: [] }); setSel(0); setChoosing(false); }}>{r.title[lang]}</Option>
            ))}
          </div>
        ) : (<>
          {s.intention.trim() && <Card className="!p-4"><p className="text-xs font-bold uppercase tracking-widest text-mute">{t(lang, 'intention')}</p><p className="mt-1 italic">{s.intention}</p></Card>}
          {finished && <Card className="flex items-center gap-4 !border-leaf/40 !bg-leaf/15"><Noor size={56} mood="wow" still /><p className="font-bold">{t(lang, 'journeyEnd')}</p></Card>}
          <VerseCard v={day.verse} label={`${t(lang, 'day')} ${sel + 1} · ${day[lang]}`} goSurah={(a, b) => { onClose(); goSurah(a, b); }} />
          <Card>
            <p className="text-xs font-bold uppercase tracking-widest text-leaf">{t(lang, 'todayStep')}</p>
            <p className="mt-2 text-[17px]">{day.action[lang]}</p>
            <Btn className={`mt-4 w-full ${done ? '!bg-leaf' : ''}`} disabled={done}
              onClick={() => { tick(); set({ journeyDone: [...s.journeyDone, sel] }); }}>{done ? `✓ ${t(lang, 'doneDay')}` : t(lang, 'markDone')}</Btn>
          </Card>
          <JourneyPath plan={plan} lang={lang} state={state} current={sel} onPick={(i) => { tick(); setSel(i); }} />
          <Btn kind="ghost" className="mb-4" onClick={() => { tick(); setChoosing(true); }}>{t(lang, 'restart')}</Btn>
        </>)}
      </div>
    </div>
  );
}
