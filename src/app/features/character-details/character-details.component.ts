import { Component, computed, DestroyRef, inject, signal } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { switchMap, catchError, forkJoin, of, map, tap } from "rxjs";
import { Character, Episode } from "../../core/models/character.model";
import { RestApiService } from "../../core/services/rest-api.service";
import { CommonModule } from "@angular/common";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import {
  CommonTableComponent,
  TableColumn,
} from "../../shared/common-table-data/common-table-data.component";

@Component({
  selector: "app-character-details",
  imports: [
    CommonModule,
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    CommonTableComponent,
  ],
  templateUrl: "./character-details.component.html",
  styleUrl: "./character-details.component.scss",
})
export class CharacterDetailsComponent {
  private route = inject(ActivatedRoute);
  private readonly service = inject(RestApiService);

  readonly episodeColumns: TableColumn[] = [
    { key: "name", label: "Episode name" },
    { key: "air_date", label: "Air date" },
    { key: "episode", label: "Episode" },
  ];

  character = signal<Character | null>(null);
  episodes = signal<Episode[]>([]);
  loading = signal(true);
  errorMessage = signal("");

  episodeRows = computed(() =>
    this.episodes().map((episode) => ({ ...episode }))
  );

  constructor() {
    // paramMap emits again if the id in the url changes (e.g. /characters/1 -> /characters/2)
    const id = this.route.snapshot.paramMap.get("id") ?? "";

    this.service
      .getCharacter(id)
      .pipe(
        tap((character) => this.character.set(character)),
        // the only switchMap: episode ids are known only after the character loads
        switchMap((character) => {
          const ids = character.episode.map((url) =>
            Number(url.split("/").pop())
          );
          return this.service.getEpisodes(ids); // ONE request: /episode/1,2,3,...
        }),
        catchError(() => {
          this.errorMessage.set(
            "Could not load this character or its episodes. Please try again."
          );
          return of([] as Episode[]);
        }),
        takeUntilDestroyed()
      )
      .subscribe((episodes) => {
        this.episodes.set(episodes);
        this.loading.set(false);
      });
  }
}
