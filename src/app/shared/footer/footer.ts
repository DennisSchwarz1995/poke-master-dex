import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  imports: [RouterLink],
  standalone: true,
  template: `<footer
    class="flex flex-col sm:flex-row items-center justify-between mx-auto bg-[var(--color-bg-secondary)] max-w-5xl rounded-2xl border border-theme p-8 gap-4"
  >
    <div class="flex items-center gap-4">
      <img src="/favicon.ico" alt="Poke Master Dex" class="size-10 rounded-xl shrink-0" />
      <span class="text-sm font-bold tracking-wider text-[var(--color-text-tertiary)] max-w-md"
        >Poke-Master-Dex is a fan site and is not affiliated with or endorsed by Pokémon, Nintendo,
        Game Freak, or The Pokémon Company.</span
      >
    </div>
    <div
      class="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-sm font-semibold text-secondary shrink-0"
    >
      <a routerLink="/imprint" class="hover:text-primary transition-colors">Impressum</a>
      <a routerLink="/privacy" class="hover:text-primary transition-colors">Datenschutz</a>
    </div>
  </footer>`,
})
export class Footer {}
