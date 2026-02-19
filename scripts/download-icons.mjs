/**
 * Download Pokémon icons from PokeAPI/sprites and PokéSprite
 * Run with: node scripts/download-icons.mjs
 */

import fs from 'fs';
import https from 'https';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const ASSETS = path.join(ROOT, 'src', 'assets', 'images');

// ----- Helpers -----

function mkdir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function downloadFile(url, dest) {
  return new Promise((resolve) => {
    if (fs.existsSync(dest)) {
      return resolve({ ok: true, skipped: true });
    }
    const file = fs.createWriteStream(dest);
    https.get(url, (res) => {
      if (res.statusCode === 200) {
        res.pipe(file);
        file.on('finish', () => { file.close(); resolve({ ok: true }); });
      } else {
        file.close();
        fs.unlink(dest, () => {});
        resolve({ ok: false, status: res.statusCode });
      }
    }).on('error', (err) => {
      file.close();
      fs.unlink(dest, () => {});
      resolve({ ok: false, err: err.message });
    });
  });
}

// Convert our slug to PokeAPI item slug (e.g. "pokeball" -> "poke-ball")
function slugToPokeApi(id) {
  const map = {
    // Pokeballs
    'pokeball': 'poke-ball',
    'greatball': 'great-ball',
    'ultraball': 'ultra-ball',
    'masterball': 'master-ball',
    'premierball': 'premier-ball',
    'healball': 'heal-ball',
    'netball': 'net-ball',
    'nestball': 'nest-ball',
    'diveball': 'dive-ball',
    'duskball': 'dusk-ball',
    'timerball': 'timer-ball',
    'quickball': 'quick-ball',
    'repeatball': 'repeat-ball',
    'luxuryball': 'luxury-ball',
    'fastball': 'fast-ball',
    'friendball': 'friend-ball',
    'lureball': 'lure-ball',
    'levelball': 'level-ball',
    'heavyball': 'heavy-ball',
    'loveball': 'love-ball',
    'moonball': 'moon-ball',
    'sportball': 'sport-ball',
    'safariball': 'safari-ball',
    'dreamball': 'dream-ball',
    'beastball': 'beast-ball',
    'cherishball': 'cherish-ball',
    'parkball': 'park-ball',
    'strangeball': 'strange-ball',
    // Hisuian balls not in PokeAPI, will be skipped
    'pokeball-hisui': null,
    'greatball-hisui': null,
    'ultraball-hisui': null,
    'heavyball-hisui': null,
    'leadenball': null,
    'gigatonball': null,
    'featherball': null,
    'wingball': null,
    'jetball': null,
    'originball': null,
    'greenball': null,
  };
  return map[id] !== undefined ? map[id] : id.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

// ----- Pokéball icons -----
async function downloadPokeballIcons() {
  const dir = path.join(ASSETS, 'pokeballs');
  mkdir(dir);

  const ballsJson = JSON.parse(fs.readFileSync(path.join(ROOT, 'dataset', 'data', 'pokeballs.json'), 'utf8'));
  const BASE = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items';

  let ok = 0, skipped = 0, failed = [];

  for (const ball of ballsJson) {
    const apiId = slugToPokeApi(ball.id);
    if (!apiId) {
      skipped++;
      continue; // No PokeAPI equivalent
    }
    const url = `${BASE}/${apiId}.png`;
    const dest = path.join(dir, `${ball.id}.png`);
    const res = await downloadFile(url, dest);
    if (res.ok) {
      if (res.skipped) skipped++;
      else ok++;
    } else {
      failed.push({ id: ball.id, url, reason: res.status || res.err });
    }
  }

  console.log(`Pokéballs: ${ok} downloaded, ${skipped} skipped, ${failed.length} failed`);
  if (failed.length) failed.forEach(f => console.log(`  ✗ ${f.id} -> ${f.url} (${f.reason})`));
}

// ----- Held Item icons (held items from items.json, excluding balls/berries) -----
async function downloadItemIcons() {
  const dir = path.join(ASSETS, 'items');
  mkdir(dir);

  const items = JSON.parse(fs.readFileSync(path.join(ROOT, 'dataset', 'data', 'items.json'), 'utf8'));
  const BASE = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items';

  // All non-berry items
  const heldItems = items.filter(i => i.category !== 'berry');

  /** Convert our lowercase-compound slug to PokeAPI hyphenated slug.
   *  Examples: choiceband -> choice-band, leftovers -> leftovers,
   *            lifeorb -> life-orb, assaultvest -> assault-vest
   */
  const ITEM_SLUG_MAP = {
    'choiceband': 'choice-band',
    'choicescarf': 'choice-scarf',
    'choicespecs': 'choice-specs',
    'lifeorb': 'life-orb',
    'leftovers': 'leftovers',
    'assaultvest': 'assault-vest',
    'focussash': 'focus-sash',
    'rockyhelmet': 'rocky-helmet',
    'eviolite': 'eviolite',
    'heavydutyboots': 'heavy-duty-boots',
    'airballoon': 'air-balloon',
    'powerherb': 'power-herb',
    'mentalherb': 'mental-herb',
    'whiteherb': 'white-herb',
    'lightball': 'light-ball',
    'toxicorb': 'toxic-orb',
    'flameorb': 'flame-orb',
    'stickybarb': 'sticky-barb',
    'ringtarget': 'ring-target',
    'laggingtail': 'lagging-tail',
    'fullincense': 'full-incense',
    'luckincense': 'luck-incense',
    'oddincense': 'odd-incense',
    'pureincense': 'pure-incense',
    'rockincense': 'rock-incense',
    'roseincense': 'rose-incense',
    'seaincense': 'sea-incense',
    'waveincense': 'wave-incense',
    'souldew': 'soul-dew',
    'deepseatooth': 'deep-sea-tooth',
    'deepseascale': 'deep-sea-scale',
    'thickclub': 'thick-club',
    'luckypunch': 'lucky-punch',
    'leek': 'leek',
    'metalcoat': 'metal-coat',
    'dragonscale': 'dragon-scale',
    'kingsrock': 'kings-rock',
    'razorfang': 'razor-fang',
    'razorclaw': 'razor-claw',
    'protector': 'protector',
    'electirizer': 'electirizer',
    'magmarizer': 'magmarizer',
    'dubiodisc': 'dubious-disc',
    'reapercloth': 'reaper-cloth',
    'upgrade': 'upgrade',
    'prismscale': 'prism-scale',
    'wrathberry': null,
    // Power items
    'poweranklet': 'power-anklet',
    'powerbelt': 'power-belt',
    'powerbracer': 'power-bracer',
    'powerlens': 'power-lens',
    'powerweight': 'power-weight',
    'powerband': 'power-band',
    // Vitamins
    'carbos': 'carbos',
    'calcium': 'calcium',
    'iron': 'iron',
    'protein': 'protein',
    'hpup': 'hp-up',
    'ppup': 'pp-up',
    'ppmax': 'pp-max',
    'zinc': 'zinc',
    // Plates
    'dracoplate': 'draco-plate',
    'dreadplate': 'dread-plate',
    'earthplate': 'earth-plate',
    'fistplate': 'fist-plate',
    'flameplate': 'flame-plate',
    'icicleplate': 'icicle-plate',
    'insectplate': 'insect-plate',
    'ironplate': 'iron-plate',
    'meadowplate': 'meadow-plate',
    'mindplate': 'mind-plate',
    'pixieplate': 'pixie-plate',
    'skyplate': 'sky-plate',
    'splashplate': 'splash-plate',
    'spookyplate': 'spooky-plate',
    'stoneplate': 'stone-plate',
    'toxicplate': 'toxic-plate',
    'zapplate': 'zap-plate',
    // Memory
    'bugmemory': 'bug-memory',
    'darkmemory': 'dark-memory',
    'dragonmemory': 'dragon-memory',
    'electricmemory': 'electric-memory',
    'fairymemory': 'fairy-memory',
    'fightingmemory': 'fighting-memory',
    'firememory': 'fire-memory',
    'flyingmemory': 'flying-memory',
    'ghostmemory': 'ghost-memory',
    'grassmemory': 'grass-memory',
    'groundmemory': 'ground-memory',
    'icememory': 'ice-memory',
    'poisonmemory': 'poison-memory',
    'psychicmemory': 'psychic-memory',
    'rockmemory': 'rock-memory',
    'steelmemory': 'steel-memory',
    'watermemory': 'water-memory',
    // Type gems
    'normalgem': 'normal-gem',
    'firegem': 'fire-gem',
    'watergem': 'water-gem',
    'electricgem': 'electric-gem',
    'grassgem': 'grass-gem',
    'icegem': 'ice-gem',
    'fightinggem': 'fighting-gem',
    'poisongem': 'poison-gem',
    'groundgem': 'ground-gem',
    'flyinggem': 'flying-gem',
    'psychicgem': 'psychic-gem',
    'buggem': 'bug-gem',
    'rockgem': 'rock-gem',
    'ghostgem': 'ghost-gem',
    'dragongem': 'dragon-gem',
    'darkgem': 'dark-gem',
    'steelgem': 'steel-gem',
    // Misc popular items
    'magnet': 'magnet',
    'blackbelt': 'black-belt',
    'blackglasses': 'black-glasses',
    'charcoal': 'charcoal',
    'dragonfang': 'dragon-fang',
    'hardstone': 'hard-stone',
    'miracleseed': 'miracle-seed',
    'mysticwater': 'mystic-water',
    'nevermeltice': 'never-melt-ice',
    'poisonbarb': 'poison-barb',
    'sharpbeak': 'sharp-beak',
    'silkscarf': 'silk-scarf',
    'silverpowder': 'silver-powder',
    'softsand': 'soft-sand',
    'spelltag': 'spell-tag',
    'twistedspoon': 'twisted-spoon',
    'widelens': 'wide-lens',
    'zoomlens': 'zoom-lens',
  };

  let ok = 0, skipped = 0, failed = [];

  for (const item of heldItems) {
    let apiId;
    if (ITEM_SLUG_MAP.hasOwnProperty(item.id)) {
      apiId = ITEM_SLUG_MAP[item.id];
    } else {
      apiId = item.id; // Try as-is
    }

    if (!apiId) {
      skipped++;
      continue;
    }

    const url = `${BASE}/${apiId}.png`;
    const dest = path.join(dir, `${item.id}.png`);
    const res = await downloadFile(url, dest);
    if (res.ok) {
      if (res.skipped) skipped++;
      else ok++;
    } else {
      failed.push({ id: item.id, url, reason: res.status || res.err });
    }
  }

  console.log(`Items: ${ok} downloaded, ${skipped} skipped, ${failed.length} failed`);
  if (failed.length > 0) {
    const shown = failed.slice(0, 10);
    shown.forEach(f => console.log(`  ✗ ${f.id} (${f.reason})`));
    if (failed.length > 10) console.log(`  ... and ${failed.length - 10} more`);
  }
}

// ----- Type icons (from PokéSprite) -----
async function downloadTypeIcons() {
  const dir = path.join(ASSETS, 'types');
  mkdir(dir);

  const types = [
    'normal', 'fire', 'water', 'electric', 'grass', 'ice',
    'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug',
    'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'
  ];

  const BASE = 'https://raw.githubusercontent.com/msikma/pokesprite/master/misc/types/gen8';
  let ok = 0, skipped = 0, failed = [];

  for (const type of types) {
    const url = `${BASE}/${type}.png`;
    const dest = path.join(dir, `${type}.png`);
    const res = await downloadFile(url, dest);
    if (res.ok) {
      if (res.skipped) skipped++;
      else ok++;
    } else {
      failed.push({ type, url, reason: res.status || res.err });
    }
  }

  console.log(`Types: ${ok} downloaded, ${skipped} skipped, ${failed.length} failed`);
  if (failed.length) failed.forEach(f => console.log(`  ✗ ${f.type} (${f.reason})`));
}

// ----- Berry icons -----
async function downloadBerryIcons() {
  const dir = path.join(ASSETS, 'berries');
  mkdir(dir);

  const items = JSON.parse(fs.readFileSync(path.join(ROOT, 'dataset', 'data', 'items.json'), 'utf8'));
  const berries = items.filter(i => i.category === 'berry');
  const BASE = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items';

  let ok = 0, skipped = 0, failed = [];

  for (const berry of berries) {
    const apiId = berry.id.replace(/berry$/, '-berry'); // e.g. cheriberry -> cheri-berry
    const url = `${BASE}/${apiId}.png`;
    const dest = path.join(dir, `${berry.id}.png`);
    const res = await downloadFile(url, dest);
    if (res.ok) {
      if (res.skipped) skipped++;
      else ok++;
    } else {
      failed.push({ id: berry.id, url, reason: res.status || res.err });
    }
  }

  console.log(`Berries: ${ok} downloaded, ${skipped} skipped, ${failed.length} failed`);
}

// ----- Main -----
async function main() {
  console.log('📦 Downloading Pokémon icons...\n');
  mkdir(ASSETS);

  await downloadPokeballIcons();
  await downloadItemIcons();
  await downloadBerryIcons();
  await downloadTypeIcons();

  console.log('\n✅ Done! Icons saved to src/assets/images/');
}

main().catch(console.error);
