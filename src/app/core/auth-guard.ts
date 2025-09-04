
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { FirebaseService } from './firebase.service';
import { map, take } from 'rxjs/operators';

export const authGuard: CanActivateFn = () => {
  const auth = inject(FirebaseService);
  const router = inject(Router);

  return auth.user$.pipe(
    take(1),
    map(u => {
      if (u) return true;
      router.navigateByUrl('/login');
      return false;
    })
  );
};
