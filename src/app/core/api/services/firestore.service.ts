import { Injectable, inject } from '@angular/core';
import { 
  Firestore, 
  collection, 
  collectionData, 
  doc, 
  docData, 
  addDoc, 
  updateDoc, 
  writeBatch,
  deleteDoc,
  Timestamp
} from '@angular/fire/firestore';
import { Observable, of } from 'rxjs';
import { AuthService } from '../../auth/services/auth.service';
import { Dex, Box, BoxSlot } from '../../../shared/models/dex.model';
import { Trainer } from '../../../shared/models/trainer.model';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {
  private firestore = inject(Firestore);
  private authService = inject(AuthService);
  
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
      updatedAt: Timestamp.now()
    };
    
    const docRef = await addDoc(dexCollection, newDex);
    return docRef.id;
  }
  
  async initializeBoxes(userId: string, dexId: string, startBox: number): Promise<void> {
    const batch = writeBatch(this.firestore);
    
    for (let boxNum = 1; boxNum <= 200; boxNum++) {
      const boxRef = doc(this.firestore, `users/${userId}/dexes/${dexId}/boxes/${boxNum}`);
      
      const slots: BoxSlot[] = Array.from({ length: 30 }, (_, i) => {
        const globalPosition = (boxNum - startBox) * 30 + i + 1;
        const pokemonId = (globalPosition > 0 && globalPosition <= 1025) 
          ? globalPosition 
          : null;
        
        return {
          position: i + 1,
          pokemonId,
          isShiny: false,
          isOwned: false
        };
      });
      
      batch.set(boxRef, {
        boxNumber: boxNum,
        name: `Box ${boxNum}`,
        slots
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
    updates: Partial<BoxSlot>
  ): Promise<void> {
    const userId = this.authService.user()?.uid;
    if (!userId) throw new Error('User not authenticated');
    
    const boxRef = doc(this.firestore, `users/${userId}/dexes/${dexId}/boxes/${boxNumber}`);
    
    const fieldPath = `slots.${slotPosition - 1}`;
    const updateData: Record<string, unknown> = {};
    
    Object.keys(updates).forEach(key => {
      updateData[`${fieldPath}.${key}`] = updates[key as keyof BoxSlot];
    });
    
    return updateDoc(boxRef, updateData);
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
      createdAt: Timestamp.now()
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
}
