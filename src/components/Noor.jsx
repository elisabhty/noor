import happy from '../assets/mascot/noor-happy.webp';
import calm from '../assets/mascot/noor-calm.webp';
import wow from '../assets/mascot/noor-wow.webp';
import sleepy from '../assets/mascot/noor-sleepy.webp';

const FACES = { happy, calm, wow, sleepy };

// Noor, la petite lanterne. mood : 'happy' | 'calm' (yeux fermés) | 'wow' | 'sleepy'.
// Le cadre fait size × 1,25 (comme avant) ; la lanterne s'y balance doucement, cligne des yeux
// quand elle sourit, et un halo doré respire derrière elle.
export default function Noor({ size = 120, mood = 'happy', still = false, className = '' }) {
  const face = FACES[mood] || happy;
  const blink = !still && mood === 'happy';
  return (
    <span role="img" aria-label="Noor" className={`relative inline-block shrink-0 ${className}`} style={{ width: size, height: size * 1.25 }}>
      <span className={`noor-halo ${still ? '' : 'noor-halo-live'}`} />
      <span className={`absolute inset-0 ${still ? '' : 'noor-bob'}`}>
        <img src={face} alt="" draggable={false} className="absolute inset-0 h-full w-full object-contain" />
        {blink && <img src={calm} alt="" draggable={false} className="noor-blink absolute inset-0 h-full w-full object-contain" />}
      </span>
      {mood === 'sleepy' && !still && <span className="noor-z" style={{ fontSize: Math.max(10, size * 0.17) }}>z</span>}
    </span>
  );
}
