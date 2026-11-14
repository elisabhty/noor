import { t } from '../lib/i18n.js';

const ART = ['#f4bd50', '#e8873a', '#4fc3a1', '#f4bd50', '#e8873a', '#7fb7e6', '#4fc3a1'];

// Petite vignette abstraite par jour (soleil, croissant, feuille…), dessinée ici.
function Art({ i, dim }) {
  const c = ART[i];
  return (
    <svg viewBox="0 0 64 64" className={`h-16 w-16 shrink-0 rounded-2xl ${dim ? 'opacity-40' : ''}`} style={{ background: '#0f2d2b' }}>
      {i % 4 === 0 && <><circle cx="32" cy="36" r="14" fill={c} /><path d="M8 46h48" stroke="#f7f0e0" strokeWidth="2" opacity=".5" /></>}
      {i % 4 === 1 && <path d="M40 14a20 20 0 100 36 16 16 0 010-36z" fill={c} />}
      {i % 4 === 2 && <><path d="M32 54V26" stroke={c} strokeWidth="3" strokeLinecap="round" /><path d="M32 40c-10 0-14-8-14-14 8 0 14 4 14 14zM32 34c8 0 12-6 12-12-7 0-12 4-12 12z" fill={c} /></>}
      {i % 4 === 3 && <><rect x="29" y="26" width="6" height="24" rx="3" fill="#f7f0e0" opacity=".8" /><path d="M32 12c4 5 5 8 0 12-5-4-4-7 0-12z" fill={c} /></>}
    </svg>
  );
}

// Chemin en zigzag des 7 jours. `state(i)` renvoie 'done' | 'open' | 'locked'.
export default function JourneyPath({ plan, lang, state = () => 'open', onPick, current }) {
  return (
    <div className="flex flex-col">
      {plan.days.map((d, i) => {
        const st = state(i); const left = i % 2 === 0;
        return (
          <div key={i}>
            <button disabled={!onPick || st === 'locked'} onClick={() => onPick?.(i)}
              className={`rise flex w-[88%] items-center gap-4 rounded-3xl border p-4 text-left ${left ? '' : 'ml-auto flex-row-reverse'} ${current === i ? 'border-gold bg-gold/10' : 'border-line/60 bg-card/80'}`}
              style={{ animationDelay: `${i * 60}ms` }}>
              <Art i={i} dim={st === 'locked'} />
              <span className="flex-1">
                <span className="block text-[11px] font-bold uppercase tracking-[.2em] text-gold">{t(lang, 'day')} {i + 1}{st === 'done' ? ' ✓' : ''}</span>
                <span className={`block text-[17px] font-bold leading-snug ${st === 'locked' ? 'text-mute' : ''}`}>{d[lang]}</span>
                <span className="mt-0.5 block text-sm text-mute">{d.verse.name} {d.ref}</span>
              </span>
            </button>
            {i < plan.days.length - 1 && (
              <svg viewBox="0 0 200 40" className="mx-auto h-9 w-1/2" style={{ transform: left ? 'none' : 'scaleX(-1)' }}>
                <path d="M30 4c10 26 110 6 140 32" fill="none" stroke="#9db8b2" strokeWidth="3" strokeLinecap="round" strokeDasharray="1 12" />
              </svg>
            )}
          </div>
        );
      })}
    </div>
  );
}
