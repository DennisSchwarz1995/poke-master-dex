import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const datasetRoot = path.join(__dirname, '../dataset/data');
const pokemonDir = path.join(datasetRoot, 'pokemon');
const destFile = path.join(datasetRoot, 'indices', 'standard-dex-mapping.json');
const destBoxesFile = path.join(datasetRoot, 'indices', 'standard-dex-boxes.json');
const destPersonalBoxesFile = path.join(datasetRoot, 'indices', 'personal-dex-boxes.json');

// User-configurable Box Names for Living/Shiny Living Dex
const CUSTOM_BOX_NAMES = {
  1: "Kanto 1", 2: "Kanto 2", 3: "Kanto 3", 4: "Kanto 4", 5: "Kanto 5", 6: "Kanto 6",
  7: "Johto 1", 8: "Johto 2", 9: "Johto 3", 10: "Johto 4",
  11: "Hoenn 1", 12: "Hoenn 2", 13: "Hoenn 3", 14: "Hoenn 4", 15: "Hoenn 5",
  16: "Sinnoh 1", 17: "Sinnoh 2", 18: "Sinnoh 3", 19: "Sinnoh 4",
  20: "Unova 1", 21: "Unova 2", 22: "Unova 3", 23: "Unova 4", 24: "Unova 5", 25: "Unova 6",
  26: "Kalos 1", 27: "Kalos 2", 28: "Kalos 3",
  29: "Alola 1", 30: "Alola 2", 31: "Alola 3",
  32: "Galar 1", 33: "Galar 2", 34: "Galar 3", 35: "Hisui",
  36: "Paldea 1", 37: "Paldea 2", 38: "Paldea 3", 39: "Paldea 4"
};

console.log('Generating Standard/Living Dex Mapping...');

const files = fs.readdirSync(pokemonDir).filter(f => f.endsWith('.json'));

let allPokemon = [];
for (const f of files) {
  const data = JSON.parse(fs.readFileSync(path.join(pokemonDir, f), 'utf-8'));
  allPokemon.push(data);
}

// Ensure sorting by dex number first, then ID
allPokemon.sort((a, b) => {
  if (a.dexNum !== b.dexNum) return a.dexNum - b.dexNum;
  return a.id.localeCompare(b.id);
});

const formMapping = [];

const specialCases = [
  'mr-mime',
  'mime-jr',
  'ho-oh',
  'porygon-z',
  'jangmo-o',
  'hakamo-o',
  'kommo-o',
  'tapu-koko',
  'tapu-lele',
  'tapu-bulu',
  'tapu-fini',
  'type-null',
  'chi-yu',
  'chien-pao',
  'ting-lu',
  'wo-chien',
  'great-tusk',
  'scream-tail',
  'brute-bonnet',
  'flutter-mane',
  'slither-wing',
  'sandy-shocks',
  'iron-treads',
  'iron-bundle',
  'iron-hands',
  'iron-jugulis',
  'iron-moth',
  'iron-thorns',
  'roaring-moon',
  'iron-valiant',
  'walking-wake',
  'iron-leaves',
  'gouging-fire',
  'raging-bolt',
  'iron-boulder',
  'iron-crown',
];

const standardPokemon = allPokemon.filter((p) => {
  if (!p.isDefault) return false;
  if (!p.storableIn || !p.storableIn.includes('home')) return false;
  
  if (p.id.includes('-')) {
    if (specialCases.includes(p.id)) {
      return true;
    }
    return false;
  }
  return true;
});

standardPokemon.sort((a,b) => a.dexNum - b.dexNum);

for (let i = 0; i < standardPokemon.length; i++) {
   formMapping.push({ slug: standardPokemon[i].id, dexNum: standardPokemon[i].dexNum, position: i + 1 });
}

const finalBoxCount = Math.ceil(formMapping.length / 30);
let finalBoxNames = [];
for (let i = 0; i < finalBoxCount; i++) {
  let boxNum = i + 1;
  let customName = CUSTOM_BOX_NAMES[boxNum] || `Box ${boxNum}`;
  finalBoxNames.push(customName);
}

let personalBoxNames = [];
for (let i = 0; i < 40; i++) {
  let boxNum = i + 1;
  let customName = CUSTOM_BOX_NAMES[boxNum] || `Box ${boxNum}`;
  personalBoxNames.push(customName);
}

const dir = path.dirname(destFile);
if (!fs.existsSync(dir)){
    fs.mkdirSync(dir, { recursive: true });
}

fs.writeFileSync(destFile, JSON.stringify(formMapping, null, 2));
fs.writeFileSync(destBoxesFile, JSON.stringify(finalBoxNames, null, 2));
fs.writeFileSync(destPersonalBoxesFile, JSON.stringify(personalBoxNames, null, 2));

console.log(`\nSuccess!`);
console.log(`Total Pokemon in Living Dex: ${formMapping.length}`);
console.log(`Total Boxes: ${finalBoxCount}`);
