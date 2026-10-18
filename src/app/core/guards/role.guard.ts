import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Role } from '../models/character.model';
import { AuthService } from '../services/auth.service';
import { NotifyService } from '../services/notify.service';

// Each route says which roles may enter: data: { roles: ['admin'] }
export const roleGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const notify = inject(NotifyService);
  const router = inject(Router);

  const allowedRoles = route.data['roles'] as Role[];

  if (allowedRoles.includes(auth.role())) {
    return true;
  }

  notify.error('Access denied: Viewer role can only see the characters list.');
  return router.createUrlTree(['/characters']); // redirect
};
