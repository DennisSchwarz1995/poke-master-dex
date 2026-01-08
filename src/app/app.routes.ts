import { Routes } from '@angular/router';
import { authGuard } from './core/auth/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component')
      .then(m => m.LoginComponent)
  },
  {
    path: 'profile',
    loadComponent: () => import('./features/auth/profile/profile.component')
      .then(m => m.ProfileComponent),
    canActivate: [authGuard]
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard.component')
      .then(m => m.DashboardComponent),
    canActivate: [authGuard]
  },
  {
    path: 'dex/:id',
    loadComponent: () => import('./features/pokedex/dex-overview/dex-overview.component')
      .then(m => m.DexOverviewComponent),
    canActivate: [authGuard]
  },
  {
    path: 'dex/:id/box/:boxNum',
    loadComponent: () => import('./features/pokedex/box-view/box-view.component')
      .then(m => m.BoxViewComponent),
    canActivate: [authGuard]
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
