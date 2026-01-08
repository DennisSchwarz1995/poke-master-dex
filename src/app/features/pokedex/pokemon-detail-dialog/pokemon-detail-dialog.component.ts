import { Component, input, output, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BoxSlot } from '../../../shared/models/dex.model';
import { Trainer } from '../../../shared/models/trainer.model';
import { PokeapiService } from '../../../core/api/services/pokeapi.service';
import { FirestoreService } from '../../../core/api/services/firestore.service';

@Component({
  selector: 'app-pokemon-detail-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" (click)="close()">
      <div class="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto" (click)="$event.stopPropagation()">
        @if (pokemon(); as pkmn) {
          <div class="flex items-start justify-between mb-6">
            <div class="flex items-center gap-4">
              <img 
                [src]="getSpriteUrl(pkmn.pokemonId!)"
                [alt]="pokemonName()"
                class="w-24 h-24"
              />
              <div>
                <h2 class="text-2xl font-bold capitalize">{{ pokemonName() }}</h2>
                <span class="text-gray-500 font-mono">#{{ (pkmn.pokemonId || 0).toString().padStart(4, '0') }}</span>
              </div>
            </div>
            <button (click)="close()" class="text-gray-400 hover:text-gray-600 text-2xl">×</button>
          </div>
          
          <div class="space-y-4">
            <div class="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <label class="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox"
                  [(ngModel)]="isOwned"
                  class="w-5 h-5"
                />
                <span class="font-semibold">Mark as Owned</span>
              </label>
              
              <label class="flex items-center gap-2 cursor-pointer ml-4">
                <input 
                  type="checkbox"
                  [(ngModel)]="isShiny"
                  class="w-5 h-5"
                />
                <span class="font-semibold">Shiny</span>
              </label>
            </div>
            
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-semibold mb-1">Level</label>
                <input 
                  type="number"
                  [(ngModel)]="level"
                  min="1"
                  max="100"
                  class="w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500"
                  placeholder="1-100"
                />
              </div>
              
              <div>
                <label class="block text-sm font-semibold mb-1">Ball Type</label>
                <select 
                  [(ngModel)]="ball"
                  class="w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500"
                >
                  <option value="">Select Ball</option>
                  <option value="poke">Poke Ball</option>
                  <option value="great">Great Ball</option>
                  <option value="ultra">Ultra Ball</option>
                  <option value="master">Master Ball</option>
                  <option value="premier">Premier Ball</option>
                  <option value="luxury">Luxury Ball</option>
                  <option value="beast">Beast Ball</option>
                </select>
              </div>
            </div>
            
            <div>
              <label class="block text-sm font-semibold mb-1">Origin Game</label>
              <select 
                [(ngModel)]="originGame"
                class="w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500"
              >
                <option value="">Select Game</option>
                <optgroup label="Gen 1">
                  <option value="red">Red</option>
                  <option value="blue">Blue</option>
                  <option value="yellow">Yellow</option>
                </optgroup>
                <optgroup label="Gen 2">
                  <option value="gold">Gold</option>
                  <option value="silver">Silver</option>
                  <option value="crystal">Crystal</option>
                </optgroup>
                <optgroup label="Gen 3">
                  <option value="ruby">Ruby</option>
                  <option value="sapphire">Sapphire</option>
                  <option value="emerald">Emerald</option>
                  <option value="firered">FireRed</option>
                  <option value="leafgreen">LeafGreen</option>
                  <option value="colosseum">Colosseum</option>
                  <option value="xd">XD: Gale of Darkness</option>
                </optgroup>
                <optgroup label="Gen 4">
                  <option value="diamond">Diamond</option>
                  <option value="pearl">Pearl</option>
                  <option value="platinum">Platinum</option>
                  <option value="heartgold">HeartGold</option>
                  <option value="soulsilver">SoulSilver</option>
                </optgroup>
                <optgroup label="Gen 5">
                  <option value="black">Black</option>
                  <option value="white">White</option>
                  <option value="black2">Black 2</option>
                  <option value="white2">White 2</option>
                </optgroup>
                <optgroup label="Gen 6">
                  <option value="x">X</option>
                  <option value="y">Y</option>
                  <option value="omegaruby">Omega Ruby</option>
                  <option value="alphasapphire">Alpha Sapphire</option>
                </optgroup>
                <optgroup label="Gen 7">
                  <option value="sun">Sun</option>
                  <option value="moon">Moon</option>
                  <option value="ultrasun">Ultra Sun</option>
                  <option value="ultramoon">Ultra Moon</option>
                  <option value="letsgopikachu">Let's Go Pikachu</option>
                  <option value="letsgoeevee">Let's Go Eevee</option>
                </optgroup>
                <optgroup label="Gen 8">
                  <option value="sword">Sword</option>
                  <option value="shield">Shield</option>
                  <option value="brilliantdiamond">Brilliant Diamond</option>
                  <option value="shiningpearl">Shining Pearl</option>
                  <option value="legendsarceus">Legends: Arceus</option>
                </optgroup>
                <optgroup label="Gen 9">
                  <option value="scarlet">Scarlet</option>
                  <option value="violet">Violet</option>
                </optgroup>
                <optgroup label="GO & HOME">
                  <option value="pokemongo">Pokemon GO</option>
                  <option value="home">Pokemon HOME</option>
                </optgroup>
              </select>
            </div>
            
            <div class="bg-purple-50 p-4 rounded-lg">
              <label class="block text-sm font-semibold mb-2">Quick Select Trainer Profile</label>
              <select 
                (change)="onTrainerSelect($event)"
                class="w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500 bg-white"
              >
                <option value="">-- Select Saved Trainer --</option>
                @for (trainer of trainers(); track trainer.id) {
                  <option [value]="trainer.id">
                    {{ trainer.name }} (TID: {{ trainer.trainerId }})
                    @if (trainer.game) { - {{ trainer.game }} }
                  </option>
                }
              </select>
              <p class="text-xs text-gray-600 mt-1">
                Select a saved trainer to auto-fill OT and TID below
              </p>
            </div>
            
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-semibold mb-1">Original Trainer (OT)</label>
                <input 
                  type="text"
                  [(ngModel)]="originalTrainer"
                  maxlength="12"
                  class="w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500"
                  placeholder="Trainer name"
                />
              </div>
              
              <div>
                <label class="block text-sm font-semibold mb-1">Trainer ID (TID)</label>
                <input 
                  type="text"
                  [(ngModel)]="trainerId"
                  maxlength="6"
                  class="w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500"
                  placeholder="e.g., 30850"
                />
              </div>
            </div>
            
            <div>
              <label class="block text-sm font-semibold mb-1">Custom Name/Nickname</label>
              <input 
                type="text"
                [(ngModel)]="customName"
                maxlength="12"
                class="w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500"
                placeholder="Optional nickname"
              />
            </div>
            
            <div>
              <label class="block text-sm font-semibold mb-1">Notes</label>
              <textarea 
                [(ngModel)]="notes"
                rows="3"
                class="w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500"
                placeholder="Additional notes..."
              ></textarea>
            </div>
          </div>
          
          <div class="flex justify-end gap-3 mt-6">
            <button 
              (click)="close()"
              class="px-6 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button 
              (click)="save()"
              [disabled]="saving()"
              class="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {{ saving() ? 'Saving...' : 'Save' }}
            </button>
          </div>
        }
      </div>
    </div>
  `,
  styles: []
})
export class PokemonDetailDialogComponent implements OnInit {
  pokemon = input.required<BoxSlot>();
  dexId = input.required<string>();
  boxNumber = input.required<number>();
  
  closed = output<void>();
  saved = output<void>();
  
  private pokeapiService = inject(PokeapiService);
  private firestoreService = inject(FirestoreService);
  
  pokemonName = signal('Loading...');
  trainers = signal<Trainer[]>([]);
  saving = signal(false);
  
  isOwned = false;
  isShiny = false;
  level?: number;
  ball = '';
  originGame = '';
  originalTrainer = '';
  trainerId = '';
  customName = '';
  notes = '';
  
  ngOnInit() {
    const pkmn = this.pokemon();
    
    this.isOwned = pkmn.isOwned;
    this.isShiny = pkmn.isShiny;
    this.customName = pkmn.customName || '';
    this.notes = pkmn.notes || '';
    
    this.loadTrainers();
    
    if (pkmn.pokemonId) {
      this.pokeapiService.getPokemonById(pkmn.pokemonId)
        .subscribe(pokemon => {
          this.pokemonName.set(pokemon.name);
        });
    }
  }
  
  loadTrainers() {
    this.firestoreService.getUserTrainers()
      .subscribe(trainers => this.trainers.set(trainers));
  }
  
  onTrainerSelect(event: Event) {
    const select = event.target as HTMLSelectElement;
    const trainerId = select.value;
    
    if (!trainerId) return;
    
    const trainer = this.trainers().find(t => t.id === trainerId);
    if (trainer) {
      this.originalTrainer = trainer.name;
      this.trainerId = trainer.trainerId;
      if (trainer.game) {
        this.originGame = trainer.game;
      }
    }
  }
  
  getSpriteUrl(id: number): string {
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
  }
  
  async save() {
    this.saving.set(true);
    
    try {
      await this.firestoreService.updateSlot(
        this.dexId(),
        this.boxNumber(),
        this.pokemon().position,
        {
          isOwned: this.isOwned,
          isShiny: this.isShiny,
          customName: this.customName || undefined,
          notes: this.notes || undefined
        }
      );
      
      this.saved.emit();
      this.close();
    } catch (err) {
      console.error('Failed to save Pokemon details:', err);
      this.saving.set(false);
    }
  }
  
  close() {
    this.closed.emit();
  }
}
