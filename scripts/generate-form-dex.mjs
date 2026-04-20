import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const datasetRoot = path.join(__dirname, '../dataset/data');
const pokemonDir = path.join(datasetRoot, 'pokemon');
const destFile = path.join(datasetRoot, 'indices', 'form-dex-mapping.json');
const destBoxesFile = path.join(datasetRoot, 'indices', 'form-dex-boxes.json');

// User-configurable Box Names. You can edit this object anytime.
// Use the exact Box Number as the key.
// If a generated box number is not in this list, it will fallback to "Box X".
const CUSTOM_BOX_NAMES = {
  1: "Kanto 1", 2: "Kanto 2", 3: "Kanto 3", 4: "Kanto 4", 5: "Kanto 5", 6: "Kanto 6",
  7: "Kanto Females", 8: "Cap Pikachu",
  9: "Johto 1", 10: "Johto 2", 11: "Johto 3", 12: "Johto 4",
  13: "Johto Females", 14: "Unown",
  15: "Hoenn 1", 16: "Hoenn 2", 17: "Hoenn 3", 18: "Hoenn 4", 19: "Hoenn 5",
  20: "Hoenn Females", 21: "Hoenn Alternate",
  22: "Sinnoh 1", 23: "Sinnoh 2", 24: "Sinnoh 3", 25: "Sinnoh 4",
  26: "Sinnoh Females 1", 27: "Sinnoh Females 2", 28: "Sinnoh Altern.",
  29: "Unova 1", 30: "Unova 2", 31: "Unova 3", 32: "Unova 4", 33: "Unova 5", 34: "Unova 6",
  35: "Unova Alternate",
  36: "Kalos 1", 37: "Kalos 2", 38: "Kalos 3",
  39: "Kalos Altern. 1", 40: "Kalos Altern. 2", 41: "Vivillon",
  42: "Alola 1", 43: "Alola 2", 44: "Alola 3",
  45: "Alola Alternate", 46: "Alolan Forms", 47: "Unknown Region",
  48: "Galar 1", 49: "Galar 2", 50: "Galar 3", 51: "Galar Alternate",
  52: "Galarian Forms",
  53: "Alcremie 1", 54: "Alcremie 2", 55: "Alcremie 3",
  56: "Gigantamax 1", 57: "Gigantamax 2", 58: "Hisui",
  59: "Hisuian Forms", 60: "Paldea 1", 61: "Paldea 2", 62: "Paldea 3", 63: "Paldea 4",
  64: "Paldea Alternate", 65: "Paldean Forms"
};

console.log('Generating Form Dex Mapping...');

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

const regionSplits = [
  { gen: 1, start: 1, end: 151 },
  { gen: 2, start: 152, end: 251 },
  { gen: 3, start: 252, end: 386 },
  { gen: 4, start: 387, end: 493 },
  { gen: 5, start: 494, end: 649 },
  { gen: 6, start: 650, end: 721 },
  { gen: 7, start: 722, end: 809 },
  { gen: 8, start: 810, end: 905 },
  { gen: 9, start: 906, end: 1025 }
];

const formMapping = [];
let totalAdded = 0;

function padBox(text) {
  const remainder = formMapping.length % 30;
  if (remainder !== 0) {
    const paddingNeeded = 30 - remainder;
    console.log(`  Padding ${text} with ${paddingNeeded} empty slots.`);
    for (let i = 0; i < paddingNeeded; i++) {
        formMapping.push(null);
    }
  }
}

let generatedBoxNames = [];

for (const split of regionSplits) {
  console.log(`\nProcessing Generation ${split.gen}...`);
  
  const storable = (p) => !p.isMega && !p.isGmax && !p.isPrimal && !p.isBattleOnlyForm && (p.storableIn ? p.storableIn.includes('home') : true);


  let bases = allPokemon.filter(p => p.dexNum >= split.start && p.dexNum <= split.end && p.isDefault && !p.isForm && storable(p));
  bases.sort((a,b) => a.dexNum - b.dexNum);
  
  let addedA = 0;
  for (const basePkm of bases) {
    formMapping.push({ slug: basePkm.id, dexNum: basePkm.dexNum, position: formMapping.length + 1, boxGroup: `Gen ${split.gen} Bases` });
    addedA++;
    totalAdded++;
  }
  if (addedA > 0) {
    console.log(`  Added ${addedA} Base Species.`);
    padBox(`Gen ${split.gen} Bases`);
  }

  let addedB = 0;
  for (const basePkm of bases) {
    if (basePkm.hasGenderDifferences) {
      const femaleForm = allPokemon.find(f => f.dexNum === basePkm.dexNum && f.isFemaleForm && storable(f));
      if (femaleForm) {
         formMapping.push({ slug: femaleForm.id, dexNum: femaleForm.dexNum, position: formMapping.length + 1, boxGroup: `Gen ${split.gen} Females` });
      } else {
         formMapping.push({ slug: `${basePkm.id}-female`, dexNum: basePkm.dexNum, position: formMapping.length + 1, boxGroup: `Gen ${split.gen} Females` });
      }
      addedB++;
      totalAdded++;
    }
  }
  if (addedB > 0) {
    console.log(`  Added ${addedB} Female Forms.`);
    padBox(`Gen ${split.gen} Females`);
  }


  let alternates = allPokemon.filter(p => p.dexNum >= split.start && p.dexNum <= split.end && p.isForm && !p.isRegional && !p.isFemaleForm && storable(p));
  alternates.sort((a,b) => {
    if (a.dexNum !== b.dexNum) return a.dexNum - b.dexNum;
    return a.id.localeCompare(b.id);
  });
  
  let addedC = 0;
  for (const formPkm of alternates) {
    formMapping.push({ slug: formPkm.id, dexNum: formPkm.dexNum, position: formMapping.length + 1, boxGroup: `Gen ${split.gen} Alternates` });
    addedC++;
    totalAdded++;
  }
  if (addedC > 0) {
    console.log(`  Added ${addedC} Alternate Forms.`);
    padBox(`Gen ${split.gen} Alternates`);
  }

  let regionals = allPokemon.filter(p => p.gen === split.gen && p.isForm && p.isRegional && storable(p));
  regionals.sort((a,b) => {
    if (a.dexNum !== b.dexNum) return a.dexNum - b.dexNum;
    return a.id.localeCompare(b.id);
  });

  let addedD = 0;
  for (const formPkm of regionals) {
    formMapping.push({ slug: formPkm.id, dexNum: formPkm.dexNum, position: formMapping.length + 1, boxGroup: `Gen ${split.gen} Regionals` });
    addedD++;
    totalAdded++;
  }
  if (addedD > 0) {
    console.log(`  Added ${addedD} Regional Forms.`);
    padBox(`Gen ${split.gen} Regionals`);
  }
}

for (let i = 0; i < formMapping.length; i += 30) {
  const firstReal = formMapping.slice(i, i+30).find(p => p !== null);
  if (firstReal) {
    generatedBoxNames.push(firstReal.boxGroup);
  } else {
    generatedBoxNames.push("Empty Box");
  }
}

console.log("\nGenerated Box Layout:");
let finalBoxNames = [];
for (let i = 0; i < generatedBoxNames.length; i++) {
  let boxNum = i + 1;
  let fallbackName = `Box ${boxNum}`;
  let customName = CUSTOM_BOX_NAMES[boxNum] || fallbackName;
  finalBoxNames.push(customName);
  console.log(`[Box ${boxNum}] mapped to "${customName}"`);
}

const dir = path.dirname(destFile);
if (!fs.existsSync(dir)){
    fs.mkdirSync(dir, { recursive: true });
}

fs.writeFileSync(destFile, JSON.stringify(formMapping, null, 2));
fs.writeFileSync(destBoxesFile, JSON.stringify(finalBoxNames, null, 2));

console.log(`\nSuccess!`);
console.log(`Total Storable Forms (excluding padding): ${totalAdded}`);
console.log(`Total Slots (including padding): ${formMapping.length}`);
const finalBoxCount = Math.ceil(formMapping.length / 30);
console.log(`Total Boxes: ${finalBoxCount}`);
