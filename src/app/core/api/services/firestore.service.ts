import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  doc,
  docData,
  getDoc,
  addDoc,
  updateDoc,
  writeBatch,
  deleteDoc,
  Timestamp,
} from '@angular/fire/firestore';
import { Observable, of } from 'rxjs';
import { take } from 'rxjs/operators';
import { AuthService } from '../../auth/services/auth.service';
import { Dex, Box, BoxSlot } from '../../../shared/models/dex.model';
import { Trainer } from '../../../shared/models/trainer.model';
import { ToastService } from '../../services/toast.service';

@Injectable({
  providedIn: 'root',
})
export class FirestoreService {
  private firestore = inject(Firestore);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);

  getUserDexList(): Observable<Dex[]> {
    const userId = this.authService.user()?.uid;
    if (!userId) return of([]);

    const dexCollection = collection(this.firestore, `users/${userId}/dexes`);
    return collectionData(dexCollection, { idField: 'id' }) as Observable<Dex[]>;
  }

  async createDex(dex: Omit<Dex, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const userId = this.authService.user()?.uid;
    if (!userId) throw new Error('User not authenticated');

    const dexCollection = collection(this.firestore, `users/${userId}/dexes`);
    const newDex = {
      ...dex,
      userId,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const docRef = await addDoc(dexCollection, newDex);
    this.toastService.success(`Dex ${dex.name} created successfully`);
    return docRef.id;
  }

  async initializeBoxes(
    userId: string,
    dexId: string,
    startBox: number,
    pokemonList: Array<{ slug: string; position: number } | null>,
    boxNames?: string[],
  ): Promise<void> {
    const batch = writeBatch(this.firestore);
    const totalPokemon = pokemonList.length;
    const pokemonPerBox = 30;
    const neededBoxes = Math.ceil(totalPokemon / pokemonPerBox);

    for (let offset = 0; offset < 200; offset++) {
      const boxNum = ((startBox - 1 + offset) % 200) + 1;
      const boxRef = doc(this.firestore, `users/${userId}/dexes/${dexId}/boxes/${boxNum}`);

      const slots: BoxSlot[] = Array.from({ length: pokemonPerBox }, (_, i) => {
        const slotIndex = i + 1; // 1-30
        const globalIndex = offset * pokemonPerBox + i; // Global position in pokemon list
        const pokemon = globalIndex < pokemonList.length ? pokemonList[globalIndex] : null;

        return {
          position: slotIndex,
          pokemonSlug: pokemon?.slug || null,
          isShiny: false,
          isOwned: false,
        };
      });

      batch.set(boxRef, {
        boxNumber: boxNum,
        name: boxNames && offset < boxNames.length ? boxNames[offset] : `Box ${boxNum}`,
        slots,
      });
    }

    return batch.commit();
  }

  getBox(dexId: string, boxNumber: number): Observable<Box> {
    const userId = this.authService.user()?.uid;
    if (!userId) return of({} as Box);

    const boxDoc = doc(this.firestore, `users/${userId}/dexes/${dexId}/boxes/${boxNumber}`);
    return docData(boxDoc) as Observable<Box>;
  }

  async updateSlot(
    dexId: string,
    boxNumber: number,
    slotPosition: number,
    updates: Partial<BoxSlot>,
  ): Promise<void> {
    const userId = this.authService.user()?.uid;
    if (!userId) throw new Error('User not authenticated');

    const boxRef = doc(this.firestore, `users/${userId}/dexes/${dexId}/boxes/${boxNumber}`);

    const snapshot = await getDoc(boxRef);
    if (!snapshot.exists()) throw new Error('Box does not exist');

    const data = snapshot.data();
    let slots = data['slots'];

    if (slots && typeof slots === 'object' && !Array.isArray(slots)) {
      const slotsArray = Object.values(slots) as BoxSlot[];
      slotsArray.sort((a, b) => a.position - b.position);
      slots = slotsArray;
    }

    if (!Array.isArray(slots)) {
      throw new Error('Invalid slots data');
    }

    const index = slotPosition - 1;
    if (index >= 0 && index < slots.length) {
      slots[index] = { ...slots[index], ...updates };

      Object.keys(slots[index]).forEach((key) => {
        if (slots[index][key as keyof BoxSlot] === undefined) {
          delete slots[index][key as keyof BoxSlot];
        }
      });
      return updateDoc(boxRef, { slots });
    } else {
      throw new Error(`Slot position ${slotPosition} out of bounds`);
    }
  }


  async updateMultipleSlots(
    dexId: string,
    updatesMap: Map<string, Partial<BoxSlot>>,
  ): Promise<void> {
    const userId = this.authService.user()?.uid;
    if (!userId) throw new Error('User not authenticated');

    const boxUpdates = new Map<number, Array<{ position: number; updates: Partial<BoxSlot> }>>();
    updatesMap.forEach((updates, key) => {
      const [boxNumStr, posStr] = key.split('_');
      const boxNum = parseInt(boxNumStr, 10);
      const position = parseInt(posStr, 10);
      if (!boxUpdates.has(boxNum)) {
        boxUpdates.set(boxNum, []);
      }
      boxUpdates.get(boxNum)!.push({ position, updates });
    });

    const promises = Array.from(boxUpdates.entries()).map(async ([boxNum, slotUpdates]) => {
      const boxRef = doc(this.firestore, `users/${userId}/dexes/${dexId}/boxes/${boxNum}`);
      const snapshot = await getDoc(boxRef);
      if (!snapshot.exists()) throw new Error(`Box ${boxNum} does not exist`);

      const data = snapshot.data();
      let slots = data['slots'];

      if (slots && typeof slots === 'object' && !Array.isArray(slots)) {
        const slotsArray = Object.values(slots) as BoxSlot[];
        slotsArray.sort((a, b) => a.position - b.position);
        slots = slotsArray;
      }

      if (!Array.isArray(slots)) {
        throw new Error('Invalid slots data');
      }

      slotUpdates.forEach(({ position, updates }) => {
        const index = position - 1;
        if (index >= 0 && index < slots.length) {
          slots[index] = { ...slots[index], ...updates };
          Object.keys(slots[index]).forEach((key) => {
            if (slots[index][key as keyof BoxSlot] === undefined) {
              delete slots[index][key as keyof BoxSlot];
            }
          });
        }
      });

      await updateDoc(boxRef, { slots });
    });

    await Promise.all(promises);
  }


  getDexBoxes(dexId: string): Observable<Box[]> {
    const userId = this.authService.user()?.uid;
    if (!userId) return of([]);

    const boxesCollection = collection(this.firestore, `users/${userId}/dexes/${dexId}/boxes`);
    return collectionData(boxesCollection) as Observable<Box[]>;
  }

  getDexBox(dexId: string, boxNumber: number): Observable<Box | undefined> {
    const userId = this.authService.user()?.uid;
    if (!userId) return of(undefined);

    const boxRef = doc(this.firestore, `users/${userId}/dexes/${dexId}/boxes/${boxNumber}`);
    return (docData(boxRef) as Observable<Box | undefined>).pipe(take(1));
  }

  async updateBoxName(dexId: string, boxNumber: number, newName: string): Promise<void> {
    const userId = this.authService.user()?.uid;
    if (!userId) throw new Error('User not authenticated');

    const boxRef = doc(this.firestore, `users/${userId}/dexes/${dexId}/boxes/${boxNumber}`);
    return updateDoc(boxRef, { name: newName });
  }

  async emptyBox(dexId: string, boxNumber: number): Promise<void> {
    const userId = this.authService.user()?.uid;
    if (!userId) throw new Error('User not authenticated');

    const boxRef = doc(this.firestore, `users/${userId}/dexes/${dexId}/boxes/${boxNumber}`);
    const snapshot = await getDoc(boxRef);
    if (!snapshot.exists()) throw new Error('Box does not exist');

    const data = snapshot.data();
    let slots = data['slots'];

    if (slots && typeof slots === 'object' && !Array.isArray(slots)) {
      const slotsArray = Object.values(slots) as BoxSlot[];
      slotsArray.sort((a, b) => a.position - b.position);
      slots = slotsArray;
    }

    if (!Array.isArray(slots)) throw new Error('Invalid slots data');

    // Reset all slots to not owned and not shiny
    const updatedSlots = slots.map((slot) => ({
      ...slot,
      isOwned: false,
      isShiny: false,
    }));

    return updateDoc(boxRef, { slots: updatedSlots });
  }

  async removeAllPokemon(dexId: string, boxNumber: number): Promise<void> {
    const userId = this.authService.user()?.uid;
    if (!userId) throw new Error('User not authenticated');

    const boxRef = doc(this.firestore, `users/${userId}/dexes/${dexId}/boxes/${boxNumber}`);
    const snapshot = await getDoc(boxRef);
    if (!snapshot.exists()) throw new Error('Box does not exist');

    const data = snapshot.data();
    let slots = data['slots'];

    if (slots && typeof slots === 'object' && !Array.isArray(slots)) {
      const slotsArray = Object.values(slots) as BoxSlot[];
      slotsArray.sort((a, b) => a.position - b.position);
      slots = slotsArray;
    }

    if (!Array.isArray(slots)) throw new Error('Invalid slots data');

    // Reset all slots to completely empty (remove pokemon)
    const updatedSlots = slots.map((slot) => ({
      ...slot,
      pokemonSlug: null,
      isOwned: false,
      isShiny: false,
    }));

    return updateDoc(boxRef, { slots: updatedSlots });
  }

  async autoFillBox(
    dexId: string,
    boxNumber: number,
    startBox: number,
    pokemonList: Array<{ slug: string; position: number } | null>,
    targetedNativeBoxNumber: number,
  ): Promise<void> {
    const userId = this.authService.user()?.uid;
    if (!userId) throw new Error('User not authenticated');

    const boxRef = doc(this.firestore, `users/${userId}/dexes/${dexId}/boxes/${boxNumber}`);
    const snapshot = await getDoc(boxRef);
    if (!snapshot.exists()) throw new Error('Box does not exist');

    const data = snapshot.data();
    let slots = data['slots'];

    if (slots && typeof slots === 'object' && !Array.isArray(slots)) {
      const slotsArray = Object.values(slots) as BoxSlot[];
      slotsArray.sort((a, b) => a.position - b.position);
      slots = slotsArray;
    }

    if (!Array.isArray(slots)) throw new Error('Invalid slots data');

    const pokemonPerBox = 30;
    const offset = (targetedNativeBoxNumber - startBox + 200) % 200;

    const updatedSlots = slots.map((slot, i) => {
      const globalIndex = offset * pokemonPerBox + i;
      const pokemon = globalIndex < pokemonList.length ? pokemonList[globalIndex] : null;
      const newSlug = pokemon?.slug || null;

      return {
        ...slot,
        pokemonSlug: newSlug,
        isOwned: slot.pokemonSlug === newSlug ? slot.isOwned : false,
        isShiny: slot.pokemonSlug === newSlug ? slot.isShiny : false,
      };
    });

    return updateDoc(boxRef, { slots: updatedSlots });
  }

  getDex(dexId: string): Observable<Dex> {
    const userId = this.authService.user()?.uid;
    if (!userId) return of({} as Dex);

    const dexDoc = doc(this.firestore, `users/${userId}/dexes/${dexId}`);
    return docData(dexDoc, { idField: 'id' }) as Observable<Dex>;
  }

  async deleteDex(dexId: string): Promise<void> {
    const userId = this.authService.user()?.uid;
    if (!userId) throw new Error('User not authenticated');

    const batch = writeBatch(this.firestore);

    for (let boxNum = 1; boxNum <= 200; boxNum++) {
      const boxRef = doc(this.firestore, `users/${userId}/dexes/${dexId}/boxes/${boxNum}`);
      batch.delete(boxRef);
    }

    const dexRef = doc(this.firestore, `users/${userId}/dexes/${dexId}`);
    batch.delete(dexRef);
    this.toastService.success(`Dex ${dexId} deleted successfully`);
    return batch.commit();
  }

  getUserTrainers(): Observable<Trainer[]> {
    const userId = this.authService.user()?.uid;
    if (!userId) return of([]);

    const trainersCollection = collection(this.firestore, `users/${userId}/trainers`);
    return collectionData(trainersCollection, { idField: 'id' }) as Observable<Trainer[]>;
  }

  async createTrainer(trainer: Omit<Trainer, 'id' | 'userId' | 'createdAt'>): Promise<string> {
    const userId = this.authService.user()?.uid;
    if (!userId) throw new Error('User not authenticated');

    const trainersCollection = collection(this.firestore, `users/${userId}/trainers`);
    const newTrainer = {
      ...trainer,
      userId,
      createdAt: Timestamp.now(),
    };

    const docRef = await addDoc(trainersCollection, newTrainer);
    return docRef.id;
  }

  async deleteTrainer(trainerId: string): Promise<void> {
    const userId = this.authService.user()?.uid;
    if (!userId) throw new Error('User not authenticated');

    const trainerRef = doc(this.firestore, `users/${userId}/trainers/${trainerId}`);
    return deleteDoc(trainerRef);
  }

  async updateDexName(dexId: string, newName: string): Promise<void> {
    const userId = this.authService.user()?.uid;
    if (!userId) throw new Error('User not authenticated');

    const dexRef = doc(this.firestore, `users/${userId}/dexes/${dexId}`);
    return updateDoc(dexRef, {
      name: newName,
      updatedAt: Timestamp.now(),
    });
  }
}
