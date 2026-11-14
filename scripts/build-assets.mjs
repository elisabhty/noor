// Fabrique toutes les images de Noor à partir des mascottes détourées (assets/mascot/noor-*.png) :
// images de l'app (WebP), images des widgets, icône, écran de lancement, favicon.
// Les mascottes elles-mêmes viennent de scripts/mascot/make_mascot.py.
import sharp from 'sharp';
import { mkdirSync, writeFileSync, copyFileSync, rmSync, existsSync, readFileSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const path = (p) => new URL(p, root).pathname;
const MOODS = ['happy', 'calm', 'wow', 'sleepy'];
const master = (mood) => path(`assets/mascot/noor-${mood}.png`);
const json = (p, o) => writeFileSync(path(p), JSON.stringify(o, null, 2));
const info = { author: 'xcode', version: 1 };
const clear = { r: 0, g: 0, b: 0, alpha: 0 };

// 1. Images de l'app : cadre 4:5, la lanterne occupe 88 % de la hauteur (halo ajouté en CSS).
mkdirSync(path('src/assets/mascot'), { recursive: true });
for (const mood of MOODS) {
  const W = 512, H = 640, h = Math.round(H * 0.88);
  const img = await sharp(master(mood)).resize({ height: h }).toBuffer({ resolveWithObject: true });
  const w = img.info.width, left = Math.floor((W - w) / 2), top = Math.floor((H - h) / 2);
  await sharp(img.data).extend({ left, right: W - w - left, top, bottom: H - h - top, background: clear })
    .webp({ quality: 90, alphaQuality: 100, effort: 6 }).toFile(path(`src/assets/mascot/noor-${mood}.webp`));
}

// 2. Widgets et Dynamic Island : une image par humeur, sans halo, recadrée au plus près.
const W = 'ios/App/NoorWidgets/Assets.xcassets/';
mkdirSync(path(W), { recursive: true });
json(`${W}Contents.json`, { info });
if (existsSync(path(`${W}Noor.imageset`))) rmSync(path(`${W}Noor.imageset`), { recursive: true });
const setName = { happy: 'Noor', calm: 'NoorCalm', wow: 'NoorWow', sleepy: 'NoorSleepy' };
for (const mood of MOODS) {
  const dir = `${W}${setName[mood]}.imageset/`;
  mkdirSync(path(dir), { recursive: true });
  for (const s of [1, 2, 3]) await sharp(master(mood)).resize({ height: 64 * s }).png({ compressionLevel: 9 }).toFile(path(`${dir}noor-${mood}@${s}x.png`));
  json(`${dir}Contents.json`, { images: [1, 2, 3].map((s) => ({ idiom: 'universal', filename: `noor-${mood}@${s}x.png`, scale: `${s}x` })), info });
}
const color = (r, g, b) => ({ colors: [{ idiom: 'universal', color: { 'color-space': 'srgb', components: { red: r, green: g, blue: b, alpha: '1.000' } } }], info });
for (const [name, c] of [['AccentColor', ['0.957', '0.741', '0.314']], ['WidgetBackground', ['0.043', '0.122', '0.118']]]) {
  mkdirSync(path(`${W}${name}.colorset/`), { recursive: true });
  json(`${W}${name}.colorset/Contents.json`, color(...c));
}

// 3. Icône et écran de lancement : l'image d'origine (avec son halo), réduite et posée sur son propre fond.
async function fromSource(size, lanternH) {
  const { source: [SW], box: [bx0, by0, bx1, by1] } = JSON.parse(readFileSync(path('assets/mascot/box.json'), 'utf8'));
  const k = lanternH / (by1 - by0), S = Math.round(SW * k);
  const img = await sharp(path('assets/mascot/noor-source.png')).removeAlpha().resize(S, S).raw().toBuffer();
  // Bords fondus pour se raccorder sans trace au fond uni.
  const fx = Math.round(0.06 * S), fy = Math.round(0.025 * S), alpha = Buffer.alloc(S * S);
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
    const t = Math.min(1, Math.min(x, S - 1 - x) / fx, Math.min(y, S - 1 - y) / fy);
    alpha[y * S + x] = Math.round(255 * t * t * (3 - 2 * t));
  }
  const layer = await sharp(img, { raw: { width: S, height: S, channels: 3 } })
    .joinChannel(alpha, { raw: { width: S, height: S, channels: 1 } }).png().toBuffer();
  // Couleur du fond : moyenne d'un coin de l'image d'origine.
  const corner = await sharp(path('assets/mascot/noor-source.png')).removeAlpha().extract({ left: 0, top: 0, width: 24, height: 24 }).raw().toBuffer();
  const [r, g, b] = [0, 1, 2].map((c) => Math.round(corner.filter((_, i) => i % 3 === c).reduce((x, y) => x + y, 0) / (corner.length / 3)));
  const left = Math.round(size / 2 - ((bx0 + bx1) / 2) * k), top = Math.round(size / 2 - ((by0 + by1) / 2) * k);
  const out = await sharp({ create: { width: size, height: size, channels: 3, background: { r, g, b } } })
    .composite([{ input: layer, left, top }]).png().toBuffer();
  return sharp(out).removeAlpha(); // l'icône de l'App Store ne doit pas avoir de couche alpha
}
const A = 'ios/App/App/Assets.xcassets/';
const icon = await (await fromSource(1024, 780)).png().toBuffer();
writeFileSync(path(`${A}AppIcon.appiconset/AppIcon-512@2x.png`), icon);
const splash = await (await fromSource(2732, 640)).png({ compressionLevel: 9 }).toBuffer();
for (const f of ['splash-2732x2732.png', 'splash-2732x2732-1.png', 'splash-2732x2732-2.png']) writeFileSync(path(`${A}Splash.imageset/${f}`), splash);

// 4. Version web : favicon et icône « écran d'accueil ».
await sharp(icon).resize(64).png().toFile(path('public/favicon.png'));
await sharp(icon).resize(180).png().toFile(path('public/apple-touch-icon.png'));

// 5. Les versets et la police coranique sont aussi embarqués dans l'extension de widgets.
copyFileSync(path('src/data/verses.json'), path('ios/App/NoorWidgets/verses.json'));
console.log('Images générées : app, widgets, icône, lancement, favicon.');
