import { useEffect, useRef, useState } from 'react';
import surahs from '../data/surahs.json';
import meta from '../data/meta.json';
import { useStore } from '../lib/store.js';
import { t } from '../lib/i18n.js';
import { Icon, tick } from '../components/ui.jsx';

const norm = (x) => x.toLowerCase().normalize('NFD').replace(/[̀-ͯ'’-]/g, '');

export default function Quran({ open, setOpen }) {
  const { lang } = useStore();
  const [q, setQ] = useState('');
  if (open) return <Reader id={open.id} verse={open.verse} onBack={() => setOpen(null)} />;
  const list = surahs.filter((s) => !q || norm(s.name).includes(norm(q)) || norm(s[lang]).includes(norm(q)) || String(s.id) === q.trim());
  return (
    <div>
      <h1 className="pt-2 text-[26px] font-bold">{t(lang, 'quran')}</h1>
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t(lang, 'search')}
        className="mt-3 w-full rounded-2xl border border-line/60 bg-card/70 px-4 py-3 text-[16px] text-cream placeholder:text-mute outline-none focus:border-gold" style={{ userSelect: 'text' }} />
      <div className="mt-3 flex flex-col">
        {list.map((s) => (
          <button key={s.id} onClick={() => { tick(); setOpen({ id: s.id }); }} className="flex items-center gap-4 border-b border-line/40 py-3 text-left">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-card text-sm font-bold text-gold">{s.id}</span>
            <span className="flex-1">
              <span className="block font-semibold">{s.name}</span>
              <span className="block text-sm text-mute">{s[lang]} · {s.n} {t(lang, 'verses')}</span>
            </span>
            <span className="ar text-xl text-cream/90" style={{ lineHeight: 1.6 }}>{s.ar}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function Reader({ id, verse, onBack }) {
  const { lang } = useStore();
  const s = surahs[id - 1];
  const [rows, setRows] = useState(null);
  const target = useRef(null);
  useEffect(() => {
    let alive = true;
    setRows(null);
    fetch(`./quran/${id}.json`).then((r) => r.json()).then((d) => alive && setRows(d)).catch(() => alive && setRows([]));
    return () => { alive = false; };
  }, [id]);
  useEffect(() => { if (rows && target.current) target.current.scrollIntoView({ block: 'center' }); }, [rows]);
  return (
    <div>
      <button onClick={() => { tick(); onBack(); }} className="flex items-center gap-1 pt-2 text-sm font-semibold text-gold"><Icon name="back" size={18} />{t(lang, 'back')}</button>
      <div className="mt-3 text-center">
        <p className="ar text-4xl">{s.ar}</p>
        <h1 className="text-2xl font-bold">{s.name}</h1>
        <p className="text-sm text-mute">{s[lang]} · {t(lang, s.type)} · {s.n} {t(lang, 'verses')}</p>
        {id !== 1 && id !== 9 && <p className="ar mt-4 text-2xl text-gold">{meta.bismillah}</p>}
      </div>
      <div className="mt-4 flex flex-col">
        {rows?.map(([ar, fr, en], i) => (
          <div key={i} ref={verse === i + 1 ? target : null} className={`border-b border-line/40 py-5 ${verse === i + 1 ? '-mx-3 rounded-2xl bg-gold/10 px-3' : ''}`}>
            <p className="ar text-[25px]">{ar} <span className="text-gold">﴿{(i + 1).toLocaleString('ar-EG')}﴾</span></p>
            <p className="mt-3 text-[15px] leading-relaxed text-cream/85"><span className="mr-2 font-bold text-gold">{i + 1}</span>{lang === 'fr' ? fr : en}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
