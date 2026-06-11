import { Routes } from '@angular/router';
import { authGuard } from './core/auth/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'home',
    loadComponent: () => import('./features/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'pokemon',
    loadComponent: () =>
      import('./features/pokemon/pokemon-list/pokemon-list.component').then(
        (m) => m.PokemonListComponent,
      ),
  },
  {
    path: 'pokemon/:slug',
    loadComponent: () =>
      import('./features/pokemon/pokemon-detail/pokemon-detail.component').then(
        (m) => m.PokemonDetailComponent,
      ),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('./features/auth/profile/profile.component').then((m) => m.ProfileComponent),
    canActivate: [authGuard],
  },
  {
    path: 'pokedex',
    loadComponent: () =>
      import('./features/dashboard/dex-list.component').then((m) => m.DexListComponent),
    canActivate: [authGuard],
  },
  {
    path: 'games',
    loadComponent: () =>
      import('./features/games/games-list/games-list.component').then((m) => m.GamesList),
    canActivate: [authGuard],
  },
  {
    path: 'games/:id',
    loadComponent: () =>
      import('./features/games/game-detail/game-detail.component').then(
        (m) => m.GameDetailComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'dex/:id',
    loadComponent: () =>
      import('./features/pokedex/dex-overview/dex-overview.component').then(
        (m) => m.DexOverviewComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'dex/:id/gallery',
    loadComponent: () =>
      import('./features/pokedex/box-gallery/box-gallery.component').then(
        (m) => m.BoxGalleryComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'dex/:id/box/:boxNum',
    loadComponent: () =>
      import('./features/pokedex/box-view/box-view.component').then((m) => m.BoxViewComponent),
    canActivate: [authGuard],
  },
  {
    path: 'imprint',
    loadComponent: () =>
      import('./features/legal/imprint/imprint.component').then((m) => m.ImprintComponent),
  },
  {
    path: 'privacy',
    loadComponent: () =>
      import('./features/legal/privacy/privacy.component').then((m) => m.PrivacyComponent),
  },
  {
    path: '**',
    redirectTo: 'home',
  },
];
