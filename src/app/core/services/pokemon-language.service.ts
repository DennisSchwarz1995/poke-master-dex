import { Injectable, signal } from '@angular/core';
import { DatasetPokemon } from '../../shared/models/dataset.model';

export type PokemonLangCode = 'eng' | 'fra' | 'deu' | 'jap' | 'kor' | 'chs' | 'cht';

export const POKEMON_LANGUAGES: { code: PokemonLangCode; label: string; flag: string }[] = [
  { code: 'eng', label: 'English', flag: '🇬🇧' },
  { code: 'deu', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'fra', label: 'Français', flag: '🇫🇷' },
  { code: 'jap', label: '日本語', flag: '🇯🇵' },
  { code: 'kor', label: '한국어', flag: '🇰🇷' },
  { code: 'chs', label: '简体中文', flag: '🇨🇳' },
  { code: 'cht', label: '繁體中文', flag: '🇹🇼' },
];

const STORAGE_KEY = 'pokemon-language';

@Injectable({
  providedIn: 'root',
})
export class PokemonLanguageService {
  currentLang = signal<PokemonLangCode>('eng');

  constructor() {
    this.loadLanguage();
  }

  private loadLanguage() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && POKEMON_LANGUAGES.some((l) => l.code === saved)) {
      this.currentLang.set(saved as PokemonLangCode);
    } else {
      this.currentLang.set(this.detectFromBrowser());
    }
  }

  private detectFromBrowser(): PokemonLangCode {
    const browserLang = navigator.language.toLowerCase();
    if (browserLang.startsWith('de')) return 'deu';
    if (browserLang.startsWith('fr')) return 'fra';
    if (browserLang.startsWith('ja')) return 'jap';
    if (browserLang.startsWith('ko')) return 'kor';
    if (browserLang.startsWith('zh-tw') || browserLang.startsWith('zh-hant')) return 'cht';
    if (browserLang.startsWith('zh')) return 'chs';
    return 'eng';
  }

  setLanguage(lang: PokemonLangCode) {
    this.currentLang.set(lang);
    localStorage.setItem(STORAGE_KEY, lang);
  }

  getName(pkmn: DatasetPokemon): string {
    const lang = this.currentLang();
    if (pkmn.speciesNames?.[lang]) {
      return pkmn.speciesNames[lang]!;
    }
    // Fallback: names[lang] with form suffix stripped
    const localizedName = pkmn.names?.[lang];
    if (localizedName) {
      return localizedName.replace(/\s*\(.*\)\s*$/, '');
    }
    // Ultimate fallback: English speciesNames or names
    if (pkmn.speciesNames?.['eng']) return pkmn.speciesNames['eng']!;
    const engName = pkmn.names?.['eng'] || pkmn.id;
    return engName.replace(/\s*\(.*\)\s*$/, '');
  }

  getFormLabel(pkmn: DatasetPokemon, hideDefault: boolean = false): string {
    if (hideDefault && pkmn.isDefault) {
      return '';
    }
    const lang = this.currentLang();
    return pkmn.formNames?.[lang] || pkmn.formNames?.['eng'] || '';
  }
}
