import { verses } from './verses.js';

// Parcours de 7 jours, choisi selon la réponse « Qu'est-ce qui t'amène ici ? ».
// Chaque jour : [référence, titre FR, titre EN]. Le texte du verset vient de verses.json (jamais tapé ici).
export const REASONS = {
  peace: {
    fr: 'J’ai besoin de paix', en: 'I need peace', icon: 'moon',
    title: { fr: 'Retrouver la paix du cœur', en: 'Finding peace of heart' },
    days: [['13:28', 'Là où le cœur se repose', 'Where the heart rests'], ['94:5', 'Après la difficulté', 'After hardship'], ['20:46', 'Tu n’es pas seul(e)', 'You are not alone'],
      ['93:3', 'Jamais abandonné(e)', 'Never forsaken'], ['9:51', 'Lâcher prise', 'Letting go'], ['10:62', 'À l’abri de la crainte', 'Safe from fear'], ['2:152', 'Se souvenir, remercier', 'Remember and give thanks']],
  },
  closer: {
    fr: 'Je veux me rapprocher d’Allah', en: 'I want to grow closer to Allah', icon: 'flame',
    title: { fr: 'Se rapprocher d’Allah', en: 'Growing closer to Allah' },
    days: [['50:16', 'Plus proche que tu ne crois', 'Closer than you think'], ['40:60', 'Appelle, Il répond', 'Call, He answers'], ['51:56', 'Pourquoi je suis là', 'Why I am here'],
      ['2:152', 'Un souvenir partagé', 'A shared remembrance'], ['19:96', 'Son amour', 'His love'], ['3:31', 'Suivre le chemin', 'Following the path'], ['73:8', 'Tout Lui confier', 'Devoting yourself']],
  },
  understand: {
    fr: 'Je veux mieux comprendre le Coran', en: 'I want to understand the Quran better', icon: 'book',
    title: { fr: 'Entrer dans le Coran', en: 'Entering the Quran' },
    days: [['96:1', 'Le premier mot : Lis', 'The first word: Read'], ['20:2', 'Un livre qui apaise', 'A book that eases'], ['10:57', 'Une guérison', 'A healing'],
      ['17:82', 'Une miséricorde', 'A mercy'], ['20:114', 'Demander plus de savoir', 'Asking for knowledge'], ['55:13', 'Compter les bienfaits', 'Counting the favors'], ['1:6', 'Demander le chemin', 'Asking for the path']],
  },
  regular: {
    fr: 'Je manque de régularité', en: 'I struggle to stay consistent', icon: 'clock',
    title: { fr: 'Un rythme simple à tenir', en: 'A rhythm you can keep' },
    days: [['94:7', 'Un pas après l’autre', 'One step at a time'], ['11:114', 'Les deux bouts du jour', 'Both ends of the day'], ['33:41', 'Se souvenir souvent', 'Remembering often'],
      ['87:15', 'Le nom, puis la prière', 'The name, then the prayer'], ['20:14', 'Prier pour se souvenir', 'Praying to remember'], ['94:8', 'Vers qui aspirer', 'Where to turn'], ['15:99', 'Tenir jusqu’au bout', 'Keeping on']],
  },
  hardship: {
    fr: 'Je traverse une épreuve', en: 'I am going through a hardship', icon: 'shield',
    title: { fr: 'Traverser l’épreuve', en: 'Through the hardship' },
    days: [['2:153', 'Patience et prière', 'Patience and prayer'], ['94:5', 'La facilité est là', 'Ease is near'], ['12:86', 'Dire sa peine', 'Voicing your sorrow'],
      ['21:83', 'L’appel de Job', 'The call of Job'], ['64:11', 'Un cœur guidé', 'A guided heart'], ['11:115', 'Rien n’est perdu', 'Nothing is lost'], ['93:5', 'Ce qui vient', 'What is coming']],
  },
  grateful: {
    fr: 'Je veux apprendre à remercier', en: 'I want to learn gratitude', icon: 'star',
    title: { fr: 'Le chemin de la gratitude', en: 'The path of gratitude' },
    days: [['1:2', 'Louange', 'Praise'], ['14:7', 'Remercier, recevoir plus', 'Give thanks, receive more'], ['16:18', 'Impossible à compter', 'Beyond counting'],
      ['16:53', 'D’où vient le bien', 'Where good comes from'], ['55:13', 'Lequel nierais-tu ?', 'Which would you deny?'], ['93:11', 'Le dire', 'Proclaim it'], ['55:60', 'Le bien pour le bien', 'Good for good']],
  },
};

// Petit geste du jour, le même pour tous les parcours.
export const ACTIONS = [
  { fr: 'Lis ce verset lentement, deux fois.', en: 'Read this verse slowly, twice.' },
  { fr: 'Relis-le à voix basse après une prière.', en: 'Read it again quietly after a prayer.' },
  { fr: 'Note le mot du verset qui te touche le plus.', en: 'Note the word in this verse that touches you most.' },
  { fr: 'Lis-le, puis fais 33 « Subhan Allah ».', en: 'Read it, then say “Subhan Allah” 33 times.' },
  { fr: 'Ouvre la sourate et lis les versets autour.', en: 'Open the surah and read the verses around it.' },
  { fr: 'Partage ce verset avec quelqu’un que tu aimes.', en: 'Share this verse with someone you love.' },
  { fr: 'Relis tes sept versets, garde ton préféré.', en: 'Reread your seven verses and save your favorite.' },
];

export const verseOf = (ref) => verses.find((v) => `${v.s}:${v.a}` === ref);

export function journey(reason) {
  const r = REASONS[reason] || REASONS.peace;
  return { ...r, days: r.days.map(([ref, fr, en], i) => ({ ref, fr, en, verse: verseOf(ref), action: ACTIONS[i] })) };
}

// Un nouveau jour s'ouvre chaque jour depuis le début du parcours.
export function unlockedDays(startKey, now = new Date()) {
  if (!startKey) return 1;
  const [y, m, d] = startKey.split('-').map(Number);
  const start = new Date(y, m - 1, d); const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.max(1, Math.min(7, Math.round((today - start) / 86400000) + 1));
}
