import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { switchMap, catchError, forkJoin, of } from 'rxjs';
import { Character, Episode } from '../../core/models/character.model';
import { RestApiService } from '../../core/services/rest-api.service';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonTableComponent, TableColumn } from '../../shared/common-table-data/common-table-data.component';

@Component({
  selector: 'app-character-details',
  imports: [CommonModule, RouterLink, MatButtonModule, MatIconModule, MatProgressSpinnerModule,
     CommonTableComponent],
  templateUrl: './character-details.component.html',
  styleUrl: './character-details.component.scss'
})
export class CharacterDetailsComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(RestApiService);
  private readonly destroyRef = inject(DestroyRef);

  readonly episodeColumns: TableColumn[] = [
    { key: 'name', label: 'Episode name' },
    { key: 'air_date', label: 'Air date' },
    { key: 'episode', label: 'Episode' }
  ];

  character: Character | null = null;
  episodes: Episode[] = [];
  loading = true;
  errorMessage = '';

  get episodeRows(): Record<string, unknown>[] {
    return this.episodes.map((episode) => ({
      id: episode.id,
      name: episode.name,
      air_date: episode.air_date,
      episode: episode.episode
    }));
  }

  constructor() {
    this.route.paramMap.pipe(
      switchMap((params) => {
        this.loading = true;
        this.errorMessage = '';
        this.character = null;
        this.episodes = [];
        const id = params.get('id') ?? '';
        return this.api.getCharacter(id).pipe(
          switchMap((character) => {
            this.character = character;
            const ids = character.episode.map((url) => Number(url.split('/').pop()));
            return forkJoin({ character: of(character), episodes: this.api.getEpisodes(ids) });
          })
        );
      }),
      takeUntilDestroyed(this.destroyRef),
      catchError(() => {
        this.errorMessage = 'Could not load this character or its episodes. Please try again.';
        this.loading = false;
        return of(null);
      })
    ).subscribe((result) => {
      if (!result) return;
      this.character = result.character;
      const episodes = result.episodes;
      this.episodes = Array.isArray(episodes) ? episodes : [episodes as Episode];
      this.loading = false;
    });
  }
}