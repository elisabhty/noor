import { Haptics, ImpactStyle } from '@capacitor/haptics';

export const tick = (style = ImpactStyle.Light) => Haptics.impact({ style }).catch(() => {});

export const Card = ({ className = '', children, ...p }) => (
  <div className={`rounded-3xl bg-card/80 border border-line/60 p-5 ${className}`} {...p}>{children}</div>
);

export const Btn = ({ kind = 'gold', className = '', children, ...p }) => (
  <button
    className={`rounded-full px-5 py-3 text-[15px] font-semibold active:scale-[.97] transition-transform ${
      kind === 'gold' ? 'bg-gold text-night' : kind === 'ghost' ? 'text-mute' : 'bg-line/70 text-cream'} ${className}`}
    {...p}
  >{children}</button>
);

export const Seg = ({ value, onChange, options }) => (
  <div className="flex rounded-full bg-night/60 p-1 border border-line/60">
    {options.map(([v, label]) => (
      <button key={v} onClick={() => { tick(); onChange(v); }}
        className={`flex-1 rounded-full py-2 text-sm font-semibold ${value === v ? 'bg-gold text-night' : 'text-mute'}`}>{label}</button>
    ))}
  </div>
);

export const Toggle = ({ on, onChange }) => (
  <button onClick={() => { tick(); onChange(!on); }} role="switch" aria-checked={on}
    className={`h-8 w-14 shrink-0 rounded-full p-1 transition-colors ${on ? 'bg-leaf' : 'bg-line'}`}>
    <span className={`block h-6 w-6 rounded-full bg-cream transition-transform ${on ? 'translate-x-6' : ''}`} />
  </button>
);

const paths = {
  today: 'M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M18.4 5.6 17 7M7 17l-1.4 1.4M12 8a4 4 0 100 8 4 4 0 000-8z',
  quran: 'M4 5.5C6.5 4 9.5 4 12 5.5 14.5 4 17.5 4 20 5.5v13c-2.5-1.5-5.5-1.5-8 0-2.5-1.5-5.5-1.5-8 0zM12 5.5v13',
  prayers: 'M12 7v5l3 2M12 3a9 9 0 100 18 9 9 0 000-18z',
  dhikr: 'M12 4a2.2 2.2 0 110 4.4A2.2 2.2 0 0112 4zM6 9.5a2.2 2.2 0 110 4.4 2.2 2.2 0 010-4.4zM18 9.5a2.2 2.2 0 110 4.4 2.2 2.2 0 010-4.4zM8.5 16a2.2 2.2 0 110 4.4 2.2 2.2 0 010-4.4zM15.5 16a2.2 2.2 0 110 4.4 2.2 2.2 0 010-4.4z',
  widgets: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z',
  gear: 'M12 9a3 3 0 100 6 3 3 0 000-6zM19 12l2-1.5-2-3.5-2.4.8-1.6-1L14.5 4h-5L9 6.8l-1.6 1L5 7 3 10.500 5 12l-2 1.5L5 17l2.4-.8 1.6 1 .5 2.8h5l.5-2.8 1.6-1 2.400.8 2-3.5z',
  back: 'M15 5l-7 7 7 7',
  close: 'M6 6l12 12M18 6L6 18',
  pin: 'M12 21s7-6.2 7-11a7 7 0 10-14 0c0 4.800 7 11 7 11zM12 7.500a2.500 2.500 0 100 5 2.500 2.500 0 000-5z',
};
export const Icon = ({ name, size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d={paths[name]} />
  </svg>
);

const optIcons = {
  moon: 'M20 14.500A8 8 0 019.500 4a8 8 0 1010.500 10.500z',
  flame: 'M12 3c1 3 5 5 5 10a5 5 0 01-10 0c0-2 1-3 2-4 0 2 1 3 2 3 1-2 0-6 1-9z',
  book: paths.quran, clock: paths.prayers,
  shield: 'M12 3l7 3v6c0 4.500-3 7.500-7 9-4-1.500-7-4.500-7-9V6z',
  star: 'M12 3l2.700 5.600 6.100.900-4.400 4.300 1 6.100L12 17l-5.400 2.900 1-6.100L3.200 9.500l6.100-.900z',
};
export const OptIcon = ({ name }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={optIcons[name]} /></svg>
);

// Ligne de choix des questionnaires (simple ou multiple).
export const Option = ({ on, icon, children, onClick }) => (
  <button onClick={() => { tick(); onClick(); }}
    className={`flex w-full items-center gap-3 rounded-3xl border px-5 py-4 text-left text-[16px] font-medium transition-colors ${on ? 'border-gold bg-gold/15' : 'border-line/60 bg-card/70'}`}>
    {icon && <span className={on ? 'text-gold' : 'text-mute'}><OptIcon name={icon} /></span>}
    <span className="flex-1">{children}</span>
    <span className={`flex h-6 w-6 items-center justify-center rounded-full border-2 ${on ? 'border-gold bg-gold text-night' : 'border-line'}`}>
      {on && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.500" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.500l4.500 4.500L19 7.500" /></svg>}
    </span>
  </button>
);
