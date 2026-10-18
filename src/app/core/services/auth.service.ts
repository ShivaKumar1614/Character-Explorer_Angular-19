import { Injectable, signal } from '@angular/core';
import { Role } from '../models/character.model';

// Roles are hardcoded (no real login). Change the default here if you want.
@Injectable({ providedIn: 'root' })
export class AuthService {
  role = signal<Role>('admin');

  setRole(role: Role) {
    this.role.set(role);
  }
}
