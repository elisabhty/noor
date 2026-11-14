// Dessine les images natives (mascotte des widgets, icône, écran de lancement) à partir de assets/noor.svg.
import sharp from 'sharp';
import { readFileSync, mkdirSync, writeFileSync, copyFileSync } from 'node:fs';
const root = new URL('../', import.meta.url);
const svg = readFileSync(new URL('assets/noor.svg', root));
const W = new URL('ios/App/NoorWidgets/Assets.xcassets/', root);
const A = new URL('ios/App/App/Assets.xcassets/', root);
const json = (u, o) => writeFileSync(u, JSON.stringify(o, null, 2));
const info = { author: 'xcode', version: 1 };

mkdirSync(new URL('Noor.imageset/', W), { recursive: true });
json(new URL('Contents.json', W), { info });
for (const s of [1, 2, 3]) await sharp(svg, { density: 72 * s * 2 }).resize(64 * s, 80 * s).png().toFile(new URL(`Noor.imageset/noor@${s}x.png`, W).pathname);
json(new URL('Noor.imageset/Contents.json', W), { images: [1, 2, 3].map((s) => ({ idiom: 'universal', filename: `noor@${s}x.png`, scale: `${s}x` })), info });

const color = (r, g, b) => ({ colors: [{ idiom: 'universal', color: { 'color-space': 'srgb', components: { red: r, green: g, blue: b, alpha: '1.000' } } }], info });
for (const [name, c] of [['AccentColor', ['0.957', '0.741', '0.314']], ['WidgetBackground', ['0.043', '0.122', '0.118']]]) {
  mkdirSync(new URL(`${name}.colorset/`, W), { recursive: true });
  json(new URL(`${name}.colorset/Contents.json`, W), color(...c));
}

const scene = (size, noorH) => {
  const w = Math.round(noorH * 0.8), x = Math.round((size - w) / 2), y = Math.round((size - noorH) / 2);
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
    <defs><radialGradient id="bg" cx="50%" cy="45%" r="75%"><stop offset="0" stop-color="#1d5a52"/><stop offset=".6" stop-color="#0f2f2c"/><stop offset="1" stop-color="#0b1f1e"/></radialGradient>
    <radialGradient id="halo" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#ffd98a" stop-opacity=".55"/><stop offset="1" stop-color="#ffd98a" stop-opacity="0"/></radialGradient></defs>
    <rect width="100%" height="100%" fill="url(#bg)"/>
    <circle cx="${size / 2}" cy="${size / 2 + noorH * 0.06}" r="${noorH * 0.62}" fill="url(#halo)"/>
    <svg x="${x}" y="${y}" width="${w}" height="${noorH}" viewBox="0 0 160 200">${svg.toString().replace(/<\/?svg[^>]*>/g, '')}</svg></svg>`);
};
await sharp(scene(1024, 700)).flatten({ background: '#0b1f1e' }).removeAlpha().png().toFile(new URL('AppIcon.appiconset/AppIcon-512@2x.png', A).pathname);
const splash = await sharp(scene(2732, 620)).flatten({ background: '#0b1f1e' }).removeAlpha().png().toBuffer();
for (const f of ['splash-2732x2732.png', 'splash-2732x2732-1.png', 'splash-2732x2732-2.png']) writeFileSync(new URL(`Splash.imageset/${f}`, A), splash);

// Les versets et la police coranique sont aussi embarqués dans l'extension de widgets.
copyFileSync(new URL('src/data/verses.json', root), new URL('ios/App/NoorWidgets/verses.json', root));
console.log('Images natives générées.');
