import { Injectable, signal } from '@angular/core';
import { DatasetPokemon } from '../../shared/models/dataset.model';

export type PokemonLangCode =
  | 'eng'
  | 'spa'
  | 'spa-la'
  | 'fra'
  | 'deu'
  | 'ita'
  | 'jap'
  | 'kor'
  | 'chs'
  | 'cht'
  | 'por';

export const POKEMON_LANGUAGES: {
  code: PokemonLangCode;
  label: string;
  badge: string;
}[] = [
  { code: 'eng', label: 'English', badge: 'ENG' },
  { code: 'spa', label: 'Spanish (Spain)', badge: 'ES-ES' },
  { code: 'spa-la', label: 'Spanish (Latin-America)', badge: 'ES-LA' },
  { code: 'deu', label: 'German', badge: 'DEU' },
  { code: 'fra', label: 'French', badge: 'FRA' },
  { code: 'ita', label: 'Italian', badge: 'ITA' },
  { code: 'jap', label: 'Japanese', badge: 'JPN' },
  { code: 'kor', label: 'Korean', badge: 'KOR' },
  { code: 'cht', label: 'Chinese (Traditional)', badge: 'CHT' },
  { code: 'chs', label: 'Chinese (Simplified)', badge: 'CHS' },
  { code: 'por', label: 'Portuguese (Brazil)', badge: 'PT-BR' },
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

  public detectFromBrowser(): PokemonLangCode {
    const browserLang = navigator.language.toLowerCase();
    if (browserLang.startsWith('pt')) return 'por';
    if (
      browserLang.startsWith('es-ar') ||
      browserLang.startsWith('es-mx') ||
      browserLang.startsWith('es-co') ||
      browserLang.startsWith('es-cl') ||
      browserLang.startsWith('es-pe') ||
      browserLang.startsWith('es-419')
    )
      return 'spa-la';
    if (browserLang.startsWith('es')) return 'spa';
    if (browserLang.startsWith('de')) return 'deu';
    if (browserLang.startsWith('fr')) return 'fra';
    if (browserLang.startsWith('it')) return 'ita';
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
    const localizedName = pkmn.names?.[lang];
    if (localizedName) {
      return localizedName.replace(/\s*\(.*\)\s*$/, '');
    }
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
