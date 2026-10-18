import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { switchMap, catchError, forkJoin, of, map, tap } from 'rxjs';
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
  private route = inject(ActivatedRoute);
  private readonly service = inject(RestApiService);

  readonly episodeColumns: TableColumn[] = [
    { key: 'name', label: 'Episode name' },
    { key: 'air_date', label: 'Air date' },
    { key: 'episode', label: 'Episode' }
  ];

  character = signal<Character | null>(null);
  episodes = signal<Episode[]>([]);
  loading = signal(true);
  errorMessage = signal('');

  episodeRows = computed(() => this.episodes().map((episode) => ({ ...episode })));


  constructor() {
    // paramMap emits again if the id in the url changes (e.g. /characters/1 -> /characters/2)
    this.route.paramMap
      .pipe(
        map((params) => params.get('id') ?? ''),
        tap(() => {
          // reset the screen before every load
          this.loading.set(true);
          this.errorMessage.set('');
          this.character.set(null);
          this.episodes.set([]);
        }),
        // switchMap #1: cancels the previous request if the id changes
        switchMap((id) =>
          this.service.getCharacter(id).pipe(
            tap((character) => this.character.set(character)), // show the card right away
            // switchMap #2: episode ids are known only after the character is loaded
            switchMap((character) => {
              // episode urls look like ".../episode/12" -> take the last number
              const ids = character.episode.map((url) => Number(url.split('/').pop()));
              return this.service.getEpisodes(ids); // ONE request: /episode/1,2,3,...
            }),
            // catchError is INSIDE, so one failed request does not stop the whole stream
            catchError(() => {
              this.errorMessage.set('Could not load this character or its episodes. Please try again.');
              return of([] as Episode[]);
            })
          )
        ),
        takeUntilDestroyed() // auto-unsubscribe -> no memory leak
      )
      .subscribe((episodes) => {
        this.episodes.set(episodes);
        this.loading.set(false);
      });
  }

}