import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const ASSETS = path.join(ROOT, 'public', 'assets', 'images');
const OUT = path.join(ROOT, 'src', 'app', 'core', 'constants', 'available-sprites.ts');

function readFolder(folder) {
  const dir = path.join(ASSETS, folder);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.png'))
    .map(f => path.basename(f, '.png'))
    .sort();
}

const marks = readFolder('marks');
const ribbons = readFolder('ribbons');
const items = readFolder('items');
const pokeballs = readFolder('pokeballs');

const toSet = (arr) => arr.map(s => `'${s}'`).join(', ');

const content = `export const AVAILABLE_SPRITES = {
  marks: new Set<string>([${toSet(marks)}]),
  ribbons: new Set<string>([${toSet(ribbons)}]),
  items: new Set<string>([${toSet(items)}]),
  pokeballs: new Set<string>([${toSet(pokeballs)}]),
};
`;

const dir = path.dirname(OUT);
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

fs.writeFileSync(OUT, content, 'utf8');
console.log(`Generated available-sprites.ts: ${marks.length} marks, ${ribbons.length} ribbons, ${items.length} items`);
