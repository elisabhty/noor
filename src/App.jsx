import { useEffect, useState } from 'react';
import { App as CapApp } from '@capacitor/app';
import { useStore, onOpen } from './lib/store.js';
import { t } from './lib/i18n.js';
import { Icon, tick } from './components/ui.jsx';
import Onboarding from './screens/Onboarding.jsx';
import Today from './screens/Today.jsx';
import Quran from './screens/Quran.jsx';
import Prayers from './screens/Prayers.jsx';
import Dhikr from './screens/Dhikr.jsx';
import Widgets from './screens/Widgets.jsx';
import Settings from './screens/Settings.jsx';

const TABS = ['today', 'quran', 'prayers', 'dhikr', 'widgets'];

export default function App() {
  const s = useStore();
  const [tab, setTab] = useState('today');
  const [settings, setSettings] = useState(false);
  const [openSurah, setOpenSurah] = useState(null); // { id, verse }

  useEffect(() => {
    onOpen();
    const sub = CapApp.addListener('appStateChange', ({ isActive }) => { if (isActive) onOpen(); });
    // Lien ouvert depuis un widget : noor://prayers, noor://dhikr…
    const url = CapApp.addListener('appUrlOpen', ({ url }) => {
      const target = url.replace('noor://', '').split(/[/?]/)[0];
      if (TABS.includes(target)) setTab(target);
    });
    return () => { sub.then((h) => h.remove()); url.then((h) => h.remove()); };
  }, []);
  useEffect(() => { document.documentElement.lang = s.lang; }, [s.lang]);

  if (!s.onboarded) return <Onboarding />;

  const goSurah = (id, verse) => { setOpenSurah({ id, verse }); setTab('quran'); };
  return (
    <div className="sky flex h-full flex-col">
      <main className="scroll safe-top flex-1 px-5 pb-6">
        {tab === 'today' && <Today onSettings={() => setSettings(true)} goSurah={goSurah} goTab={setTab} />}
        {tab === 'quran' && <Quran open={openSurah} setOpen={setOpenSurah} />}
        {tab === 'prayers' && <Prayers />}
        {tab === 'dhikr' && <Dhikr />}
        {tab === 'widgets' && <Widgets goTab={setTab} />}
      </main>
      <nav className="safe-bottom flex border-t border-line/60 bg-night/90 px-2 pt-2 backdrop-blur">
        {TABS.map((k) => (
          <button key={k} onClick={() => { tick(); setTab(k); if (k !== 'quran') setOpenSurah(null); }}
            className={`flex flex-1 flex-col items-center gap-1 py-1 text-[11px] font-semibold ${tab === k ? 'text-gold' : 'text-mute'}`}>
            <Icon name={k} size={23} />{t(s.lang, k)}
          </button>
        ))}
      </nav>
      {settings && <Settings onClose={() => setSettings(false)} />}
    </div>
  );
}
