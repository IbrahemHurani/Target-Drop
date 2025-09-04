import { Routes } from '@angular/router';
import { authGuard } from './core/auth-guard';
import { LoginComponent } from './pages/login/login';
export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'game', canActivate: [authGuard],
    loadComponent: () => import('./pages/game/game').then(m => m.GameComponent) },
  { path: '', redirectTo: 'game', pathMatch: 'full' },
  { path: '**', redirectTo: 'game' }
];