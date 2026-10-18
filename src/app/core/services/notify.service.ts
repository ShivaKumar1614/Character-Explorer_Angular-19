import { inject, Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

// Small wrapper so every page shows snackbars the same way.
@Injectable({ providedIn: 'root' })
export class NotifyService {
  private snackBar = inject(MatSnackBar);

  success(message: string) {
    this.snackBar.open(message, 'OK', { duration: 3000 });
  }

  error(message: string) {
    this.snackBar.open(message, 'Close', { duration: 5000,
    horizontalPosition: 'center',
    verticalPosition: 'top', panelClass: 'error-snackbar' });
  }
}
