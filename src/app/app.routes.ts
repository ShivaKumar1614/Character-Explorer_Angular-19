import { Routes } from '@angular/router';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'characters', pathMatch: 'full' },
  { path: 'characters', loadComponent: () =>
      import('./features/characters-list/characters-list.component').then((m) => m.CharactersListComponent), canActivate: [roleGuard], data: { roles: ['admin', 'viewer'] } },
  { path: 'characters/:id', loadComponent: () =>
      import('./features/character-details/character-details.component').then(
        (m) => m.CharacterDetailsComponent,
      ), canActivate: [roleGuard], data: { roles: ['admin'] } },
  { path: '**', redirectTo: 'characters' },
];