import { Injectable, signal, inject } from '@angular/core';
import { FirestoreService } from '../api/services/firestore.service';
import { BoxSlot } from '../../shared/models/dex.model';
import { QuickEditState } from '../../shared/components/toolbar/toolbar.component';

@Injectable({
  providedIn: 'root',
})
export class ToolbarService {
  private firestoreService = inject(FirestoreService);

  pendingEdits = signal<Map<string, Partial<BoxSlot>>>(new Map());
  isSavingBatch = signal(false);

  addEdit(boxNum: number, position: number, updates: Partial<BoxSlot>) {
    const key = `${boxNum}_${position}`;
    const currentMap = new Map(this.pendingEdits());
    const existing = currentMap.get(key) || {};

    currentMap.set(key, { ...existing, ...updates });
    this.pendingEdits.set(currentMap);
  }

  discardAllEdits() {
    this.pendingEdits.set(new Map());
  }

  async saveAllEdits(dexId: string): Promise<number[]> {
    if (this.pendingEdits().size === 0) return [];

    this.isSavingBatch.set(true);
    const boxesToReload = new Set<number>();

    this.pendingEdits().forEach((updates, key) => {
      const [boxNumStr] = key.split('_');
      boxesToReload.add(parseInt(boxNumStr, 10));
    });

    try {
      await this.firestoreService.updateMultipleSlots(dexId, this.pendingEdits());
      this.pendingEdits.set(new Map());
      return Array.from(boxesToReload);
    } catch (e) {
      console.error('Error saving edits', e);
      throw e;
    } finally {
      this.isSavingBatch.set(false);
    }
  }

  processToolClick(boxNumber: number, slot: BoxSlot, modeState: QuickEditState): Partial<BoxSlot> {
    const position = slot.position;
    const key = `${boxNumber}_${position}`;

    const currentPending = this.pendingEdits().get(key) || {};
    const updates: Partial<BoxSlot> = { ...currentPending };

    const currentOwned = updates.isOwned !== undefined ? updates.isOwned : !!slot.isOwned;
    const currentShiny = updates.isShiny !== undefined ? updates.isShiny : !!slot.isShiny;
    const currentGmax = updates.isGmax !== undefined ? updates.isGmax : !!slot.isGmax;
    const currentAlpha = updates.isAlpha !== undefined ? updates.isAlpha : !!slot.isAlpha;
    const currentBall = updates.ball !== undefined ? updates.ball : slot.ball;
    const currentTrainer = updates.trainerId !== undefined ? updates.trainerId : slot.trainerId;

    const mode = modeState.mode;

    if (mode === 'Owned') {
      updates.isOwned = !currentOwned;
      if (updates.isOwned) {
        updates.storedIn = 'home';
      } else {
        updates.storedIn = undefined;
        updates.ball = undefined;
      }
    }

    if (mode === 'Pokeball') {
      if (!modeState.ball) return updates;

      if (currentBall === modeState.ball) {
        updates.ball = undefined;
      } else {
        updates.ball = modeState.ball;
        if (!currentOwned) {
          updates.isOwned = true;
          updates.storedIn = 'home';
        }
      }
    }

    if (mode === 'Trainer') {
      if (!modeState.trainerId && !modeState.originalTrainer) return updates;

      const currentOriginalTrainer =
        updates.originalTrainer !== undefined ? updates.originalTrainer : slot.originalTrainer;

      if (
        currentTrainer === modeState.trainerId &&
        currentOriginalTrainer === modeState.originalTrainer
      ) {
        return updates;
      } else {
        updates.trainerId = modeState.trainerId;
        updates.originalTrainer = modeState.originalTrainer;
        updates.originGame = modeState.originGame;
        if (!currentOwned) {
          updates.isOwned = true;
          updates.storedIn = 'home';
        }
      }
    }

    if (mode === 'Shiny') updates.isShiny = !currentShiny;
    if (mode === 'Gmax') updates.isGmax = !currentGmax;
    if (mode === 'Alpha') updates.isAlpha = !currentAlpha;

    this.addEdit(boxNumber, position, updates);

    return updates;
  }
}
