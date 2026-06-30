import { BoxSlot } from '../../../shared/models/dataset.model';

export function parseBoxSlotSlug(rawSlot: BoxSlot): string | null {
  if (typeof rawSlot === 'string') return rawSlot;
  if (rawSlot && typeof rawSlot === 'object' && 'pokemon' in rawSlot) return rawSlot.pokemon;
  return null;
}
