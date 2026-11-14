// Noor, la petite lanterne. Dessin original, aucune image externe.
// mood : 'happy' | 'calm' (yeux fermés) | 'wow' | 'sleepy'
export default function Noor({ size = 120, mood = 'happy', still = false, className = '' }) {
  const closed = mood === 'calm' || mood === 'sleepy';
  return (
    <svg width={size} height={size * 1.25} viewBox="0 0 160 200" className={`${still ? '' : 'noor-bob'} ${className}`} aria-label="Noor">
      <defs>
        <radialGradient id="ng-glow" cx="50%" cy="55%" r="50%">
          <stop offset="0" stopColor="#ffd98a" stopOpacity=".7" /><stop offset="1" stopColor="#ffd98a" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="ng-glass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff3c9" /><stop offset=".55" stopColor="#ffd16a" /><stop offset="1" stopColor="#f29a3e" />
        </linearGradient>
        <linearGradient id="ng-metal" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#3aa88c" /><stop offset="1" stopColor="#1c6b5a" />
        </linearGradient>
      </defs>
      <circle cx="80" cy="112" r="78" fill="url(#ng-glow)" className={still ? '' : 'noor-glow'} />
      {/* anneau */}
      <circle cx="80" cy="20" r="11" fill="none" stroke="#1c6b5a" strokeWidth="6" />
      {/* chapeau */}
      <path d="M80 30c-6 10-30 16-36 34h72c-6-18-30-24-36-34z" fill="url(#ng-metal)" />
      <rect x="38" y="62" width="84" height="12" rx="6" fill="#16574a" />
      {/* verre */}
      <path d="M46 74h68c10 22 10 62 0 84H46c-10-22-10-62 0-84z" fill="url(#ng-glass)" />
      <path d="M58 82c-5 18-5 50 0 68" stroke="#fff" strokeOpacity=".55" strokeWidth="5" strokeLinecap="round" fill="none" />
      {/* montants */}
      <path d="M46 74c-10 22-10 62 0 84M114 74c10 22 10 62 0 84" stroke="#1c6b5a" strokeWidth="6" fill="none" strokeLinecap="round" />
      {/* visage */}
      {closed ? (
        <g stroke="#5a3210" strokeWidth="4.5" strokeLinecap="round" fill="none">
          <path d="M60 112q7 7 14 0" /><path d="M86 112q7 7 14 0" />
        </g>
      ) : (
        <g fill="#5a3210" className={still ? '' : 'noor-eye'}>
          <ellipse cx="67" cy="110" rx={mood === 'wow' ? 7 : 6} ry={mood === 'wow' ? 9 : 8} />
          <ellipse cx="93" cy="110" rx={mood === 'wow' ? 7 : 6} ry={mood === 'wow' ? 9 : 8} />
          <circle cx="69" cy="107" r="2.2" fill="#fff" /><circle cx="95" cy="107" r="2.2" fill="#fff" />
        </g>
      )}
      <ellipse cx="56" cy="124" rx="7" ry="4.5" fill="#f0703c" opacity=".45" />
      <ellipse cx="104" cy="124" rx="7" ry="4.5" fill="#f0703c" opacity=".45" />
      {mood === 'wow'
        ? <ellipse cx="80" cy="128" rx="6" ry="7" fill="#5a3210" />
        : mood === 'sleepy'
          ? <path d="M75 128h10" stroke="#5a3210" strokeWidth="4" strokeLinecap="round" />
          : <path d="M72 125q8 9 16 0" stroke="#5a3210" strokeWidth="4.5" strokeLinecap="round" fill="none" />}
      {/* socle */}
      <rect x="38" y="156" width="84" height="12" rx="6" fill="#16574a" />
      <path d="M52 168h56l-8 16H60z" fill="url(#ng-metal)" />
      {mood === 'sleepy' && <text x="118" y="60" fontSize="22" fill="#f7f0e0" opacity=".8" fontWeight="700">z</text>}
    </svg>
  );
}
