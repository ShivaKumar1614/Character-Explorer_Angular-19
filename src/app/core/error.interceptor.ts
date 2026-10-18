import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { NotifyService } from './services/notify.service';

// Runs for every HTTP call. Shows a snackbar when something fails.
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notify = inject(NotifyService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // 404 means "no characters found" for this API, so it is not a real error
      if (error.status !== 404) {
        notify.error('Something went wrong. Please try again.');
      }
      return throwError(() => error);
    })
  );
};
