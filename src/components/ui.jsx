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
