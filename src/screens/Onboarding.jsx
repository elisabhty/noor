import { useState } from 'react';
import { useStore, set } from '../lib/store.js';
import { t } from '../lib/i18n.js';
import Noor from '../components/Noor.jsx';
import { Btn, Seg } from '../components/ui.jsx';
import PlacePicker from './PlacePicker.jsx';

export default function Onboarding() {
  const { lang } = useStore();
  const [step, setStep] = useState(0);
  const finish = () => set({ onboarded: true });
  return (
    <div className="sky safe-top safe-bottom flex h-full flex-col px-6">
      {step === 0 && (
        <div className="rise flex flex-1 flex-col items-center justify-center text-center">
          <Noor size={170} mood="happy" />
          <p className="mt-8 text-sm font-semibold tracking-wide text-gold">{t(lang, 'salam')}</p>
          <h1 className="mt-2 text-3xl font-bold">{t(lang, 'ob1')}</h1>
          <p className="mt-3 max-w-xs text-mute">{t(lang, 'ob1s')}</p>
          <div className="mt-8 w-56"><Seg value={lang} onChange={(v) => set({ lang: v })} options={[['fr', 'Français'], ['en', 'English']]} /></div>
        </div>
      )}
      {step === 1 && (
        <div className="rise scroll flex-1 pt-4">
          <div className="flex items-center gap-4">
            <Noor size={64} mood="wow" still />
            <div><h1 className="text-2xl font-bold">{t(lang, 'ob2')}</h1><p className="mt-1 text-sm text-mute">{t(lang, 'ob2s')}</p></div>
          </div>
          <div className="mt-6 pb-6"><PlacePicker onDone={() => setStep(2)} /></div>
        </div>
      )}
      {step === 2 && (
        <div className="rise flex flex-1 flex-col items-center justify-center text-center">
          <Noor size={150} mood="calm" />
          <h1 className="mt-8 text-3xl font-bold">{t(lang, 'ob3')}</h1>
          <p className="mt-3 max-w-xs text-mute">{t(lang, 'ob3s')}</p>
        </div>
      )}
      <div className="flex flex-col gap-1 py-4">
        {step === 0 && <Btn onClick={() => setStep(1)}>{t(lang, 'start')}</Btn>}
        {step === 1 && <Btn kind="ghost" onClick={() => setStep(2)}>{t(lang, 'later')}</Btn>}
        {step === 2 && <Btn onClick={finish}>{t(lang, 'next')}</Btn>}
      </div>
    </div>
  );
}
