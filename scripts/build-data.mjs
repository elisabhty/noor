// Génère les données du Coran à partir du paquet quran-json (texte Uthmani de quranenc.com).
// Aucun verset n'est tapé à la main : seules les références (sourate:verset) sont choisies ici.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
const load = (f) => JSON.parse(readFileSync(new URL(`../node_modules/quran-json/dist/${f}`, import.meta.url)));
const fr = load('quran_fr.json'), en = load('quran_en.json');

// Le texte du Complexe du Roi Fahd code les tanwin « ouverts » avec U+0657, U+065E et U+0656, choisis avant
// l'arrivée des codes officiels U+08F0 (fathatan), U+08F1 (dammatan) et U+08F2 (kasratan) que la police
// Amiri Quran attend. Sans cette conversion, le dammatan ouvert s'affiche en carré vide et les deux autres
// avec une mauvaise forme. On remplace aussi l'unique espace fine (U+2009) par une espace normale.
const STANDARD = { '\u0657': '\u08F0', '\u065E': '\u08F1', '\u0656': '\u08F2', '\u2009': ' ' };
const arabic = (text) => text.replace(/[\u0657\u065E\u0656\u2009]/g, (c) => STANDARD[c]);

const REFS = `1:2 1:5 1:6 2:152 2:153 2:186 2:201 2:216 3:8 3:31 3:139 4:28 6:17 7:23 7:56 7:199 7:205 8:2 8:46 9:51 9:129
10:57 10:62 10:107 11:6 11:114 11:115 12:86 12:87 13:28 14:7 14:34 14:40 14:41 15:49 15:56 15:98 15:99 16:18 16:53 16:90 16:96 16:97
16:127 16:128 17:24 17:80 17:82 18:10 18:46 19:96 20:2 20:8 20:14 20:25 20:26 20:46 20:114 21:83 21:87 21:89 21:107 23:1 23:2 23:97 23:118
25:58 25:63 25:74 26:62 26:80 26:83 27:62 29:45 29:69 30:21 30:60 31:17 31:18 33:3 33:41 33:42 33:43 33:56 35:15 36:58 36:82 39:10 39:53
40:44 40:60 41:30 41:34 42:19 42:43 47:7 49:10 49:13 50:16 51:56 51:58 53:39 55:13 55:60 57:4 59:22 64:11 65:7
70:5 73:8 87:14 87:15 87:17 89:28 93:3 93:4 93:5 93:11 94:5 94:7 94:8 95:4 96:1 97:3 99:7 108:1 108:2 110:3 112:1 112:2 113:1 114:1`
  .split(/\s+/).filter(Boolean);

const MAX_AR = 170, MAX_TR = 230;
const verses = [], skipped = [];
for (const ref of REFS) {
  const [s, a] = ref.split(':').map(Number);
  const cf = fr[s - 1], ce = en[s - 1];
  const vf = cf.verses[a - 1], ve = ce.verses[a - 1];
  if (!vf || vf.id !== a || ve.id !== a) throw new Error('Référence introuvable ' + ref);
  if (vf.text !== ve.text) throw new Error('Texte arabe incohérent ' + ref);
  if (vf.text.length > MAX_AR || vf.translation.length > MAX_TR || ve.translation.length > MAX_TR) { skipped.push(ref); continue; }
  verses.push({ s, a, ar: arabic(vf.text), fr: vf.translation, en: ve.translation, name: cf.transliteration, nameFr: cf.translation, nameEn: ce.translation });
}
writeFileSync(new URL('../src/data/verses.json', import.meta.url), JSON.stringify(verses));

const dir = new URL('../public/quran/', import.meta.url);
mkdirSync(dir, { recursive: true });
const index = fr.map((c, i) => ({ id: c.id, ar: c.name, name: c.transliteration, fr: c.translation, en: en[i].translation, type: c.type, n: c.total_verses }));
writeFileSync(new URL('../src/data/surahs.json', import.meta.url), JSON.stringify(index));
writeFileSync(new URL('../src/data/meta.json', import.meta.url), JSON.stringify({ bismillah: arabic(fr[0].verses[0].text) }));
fr.forEach((c, i) => writeFileSync(new URL(`${c.id}.json`, dir),
  JSON.stringify(c.verses.map((v, j) => [arabic(v.text), v.translation, en[i].verses[j].translation]))));
console.log(`${verses.length} versets retenus, ${skipped.length} trop longs écartés : ${skipped.join(' ')}`);
