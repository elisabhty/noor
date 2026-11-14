import { useState } from 'react';
import { useStore, set } from '../lib/store.js';
import { t } from '../lib/i18n.js';
import { PAYWALL, purchase } from '../lib/paywall.js';
import Noor from '../components/Noor.jsx';
import { Btn, Icon, Toggle, tick } from '../components/ui.jsx';

export default function Paywall({ onDone }) {
  const { lang, name } = useStore();
  const [trial, setTrial] = useState(true);
  const [plan, setPlan] = useState('weekly');
  const end = new Date(); end.setDate(end.getDate() + PAYWALL.trialDays - 1);
  const endLabel = end.toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' });
  const withTrial = trial && plan === 'weekly';

  async function buy() {
    tick();
    try { const r = await purchase(plan); if (r.ok && !r.simulated) set({ premium: true }); onDone(); } catch { /* achat annulé : on reste sur la page */ }
  }
  const Plan = ({ id, title, line }) => (
    <button onClick={() => { tick(); setPlan(id); }} className={`w-full rounded-3xl border-2 px-5 py-4 text-left ${plan === id ? 'border-gold bg-gold/10' : 'border-line/60 bg-card/70'}`}>
      <span className="block text-[17px] font-bold">{title}</span><span className="block text-mute">{line}</span>
    </button>
  );
  return (
    <div className="sky safe-top safe-bottom scroll flex h-full flex-col px-6">
      <button onClick={() => { tick(); onDone(); }} aria-label={t(lang, 'skip')} className="self-start p-2 text-mute"><Icon name="close" /></button>
      <div className="flex flex-col items-center text-center">
        <Noor size={96} mood="happy" />
        <h1 className="mt-3 text-[26px] font-bold leading-tight">{t(lang, 'pwTitle', name)}</h1>
      </div>
      <ul className="mt-5 flex flex-col gap-3">
        {['pw1', 'pw2', 'pw3'].map((k) => (
          <li key={k} className="flex items-center gap-3 text-[16px]">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-leaf text-night">✓</span>{t(lang, k)}
          </li>
        ))}
      </ul>
      <div className="mt-5 flex items-center justify-between gap-4 rounded-3xl border border-line/60 bg-card/70 px-5 py-4">
        <span className="text-[16px] font-medium">{t(lang, 'pwTrial')}</span><Toggle on={trial} onChange={setTrial} />
      </div>
      <div className="mt-3 flex flex-col gap-3">
        <Plan id="weekly" title={trial ? t(lang, 'pwTrialLine', PAYWALL.trialDays) : t(lang, 'pwWeek')}
          line={trial ? t(lang, 'pwThen', PAYWALL.weekly[lang]) : t(lang, 'pwWeekLine', PAYWALL.weekly[lang])} />
        <Plan id="yearly" title={t(lang, 'pwYear')} line={t(lang, 'pwYearLine', PAYWALL.yearly[lang])} />
      </div>
      <p className="mt-4 h-5 text-center text-sm font-semibold text-mute">{withTrial ? t(lang, 'pwCancel', endLabel) : ''}</p>
      <div className="mt-auto flex flex-col pt-4">
        <Btn onClick={buy}>{withTrial ? t(lang, 'pwTry') : t(lang, 'pwGo')}</Btn>
        <div className="flex justify-center gap-5 py-3 text-xs text-mute">
          <span>{t(lang, 'terms')}</span><span>{t(lang, 'privacy')}</span><button onClick={onDone}>{t(lang, 'restore')}</button>
        </div>
      </div>
    </div>
  );
}
