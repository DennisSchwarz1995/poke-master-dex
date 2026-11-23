import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  imports: [RouterLink],
  standalone: true,
  template: `<div class="w-full px-4 sm:px-6">
    <footer
      class="flex flex-col md:flex-row items-center justify-between mx-auto bg-[var(--color-bg-secondary)] max-w-5xl rounded-2xl border border-theme p-5 sm:p-6 md:p-8 gap-4 sm:gap-6"
    >
      <div class="flex flex-col sm:flex-row items-center text-center sm:text-left gap-3 sm:gap-4">
        <img
          src="/favicon.ico"
          alt="Poke Master Dex"
          class="size-9 sm:size-10 rounded-xl shrink-0"
        />
        <span
          class="text-xs sm:text-sm font-semibold sm:font-bold tracking-normal sm:tracking-wider text-[var(--color-text-secondary)] max-w-md leading-relaxed"
          >Poke-Master-Dex is a fan site and is not affiliated with or endorsed by Pokémon, Nintendo,
          Game Freak, or The Pokémon Company.</span
        >
      </div>
      <div
        class="flex flex-row items-center gap-4 text-xs sm:text-sm font-semibold text-secondary shrink-0"
      >
        <a routerLink="/imprint" class="hover:text-primary transition-colors">Impressum</a>
        <a routerLink="/privacy" class="hover:text-primary transition-colors">Datenschutz</a>
      </div>
    </footer>
  </div>`,
})
export class Footer {}
