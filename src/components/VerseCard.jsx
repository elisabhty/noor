import { useStore, set } from '../lib/store.js';
import { t } from '../lib/i18n.js';
import { Card, tick } from './ui.jsx';

export const refLabel = (v) => `${v.name} ${v.s}:${v.a}`;

export default function VerseCard({ v, label, goSurah }) {
  const { lang, favs } = useStore();
  const id = `${v.s}:${v.a}`;
  const fav = favs.includes(id);
  const toggle = () => { tick(); set({ favs: fav ? favs.filter((x) => x !== id) : [id, ...favs] }); };
  const share = async () => {
    tick();
    const text = `${v.ar}\n\n${v[lang]}\n— ${refLabel(v)}`;
    try { if (navigator.share) await navigator.share({ text }); else await navigator.clipboard.writeText(text); } catch { /* partage annulé */ }
  };
  return (
    <Card className="rise">
      {label && <p className="text-xs font-bold uppercase tracking-widest text-gold">{label}</p>}
      <p className="ar mt-3 text-[26px] text-cream">{v.ar}</p>
      <p className="mt-4 text-[16px] leading-relaxed text-cream/90">{v[lang]}</p>
      <p className="mt-3 text-sm text-mute">{refLabel(v)} · {lang === 'fr' ? v.nameFr : v.nameEn}</p>
      <div className="mt-4 flex flex-wrap gap-2 text-sm font-semibold">
        <button onClick={toggle} className={`rounded-full px-4 py-2 ${fav ? 'bg-gold text-night' : 'bg-line/70'}`}>{fav ? t(lang, 'saved') : t(lang, 'save')}</button>
        <button onClick={share} className="rounded-full bg-line/70 px-4 py-2">{t(lang, 'share')}</button>
        {goSurah && <button onClick={() => { tick(); goSurah(v.s, v.a); }} className="rounded-full bg-line/70 px-4 py-2">{t(lang, 'read')}</button>}
      </div>
    </Card>
  );
}
