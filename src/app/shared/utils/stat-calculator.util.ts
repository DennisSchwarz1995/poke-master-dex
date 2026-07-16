export const STAT_DEFINITIONS = [
  { id: 'hp', label: 'HP', baseKey: 'baseHp' },
  { id: 'atk', label: 'Atk', baseKey: 'baseAtk' },
  { id: 'def', label: 'Def', baseKey: 'baseDef' },
  { id: 'spa', label: 'SpA', baseKey: 'baseSpAtk' },
  { id: 'spd', label: 'SpD', baseKey: 'baseSpDef' },
  { id: 'spe', label: 'Spe', baseKey: 'baseSpeed' },
] as const;

export function calculateHP(base: number, level: number, iv: number, ev: number): number {
  return Math.floor(((2 * base + iv + Math.floor(ev / 4)) * level) / 100) + level + 10;
}

export function calculateStat(
  base: number,
  level: number,
  isRaised: boolean,
  isLowered: boolean,
  iv: number,
  ev: number,
): number {
  let stat = Math.floor(((2 * base + iv + Math.floor(ev / 4)) * level) / 100) + 5;
  if (isRaised) stat = Math.floor(stat * 1.1);
  if (isLowered) stat = Math.floor(stat * 0.9);
  return stat;
}
