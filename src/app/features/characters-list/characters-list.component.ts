import { Component, DestroyRef, inject } from "@angular/core";
import {
  CommonTableComponent,
  TableColumn,
} from "../../shared/common-table-data/common-table-data.component";
import {
  Character,
} from "../../core/models/character.model";
import { MatButtonToggleModule } from "@angular/material/button-toggle";
import { MatIconModule } from "@angular/material/icon";
import { Router } from "@angular/router";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import {
  catchError,
  of,
  debounceTime,
  distinctUntilChanged,
  finalize,
  startWith,
} from "rxjs";
import { CommonModule } from "@angular/common";
import { ReactiveFormsModule, FormControl } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { RestApiService } from "../../core/services/rest-api.service";
import { MatCardModule } from "@angular/material/card";

@Component({
  selector: "app-characters-list",
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatIconModule, MatCardModule,
     MatButtonModule, MatButtonToggleModule, MatProgressSpinnerModule, CommonTableComponent
  ],
  templateUrl: "./characters-list.component.html",
  styleUrl: "./characters-list.component.scss",
})
export class CharactersListComponent {
 private readonly api = inject(RestApiService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);

  readonly searchControl = new FormControl('', { nonNullable: true });
  readonly columns: TableColumn[] = [
    { key: 'image', label: 'Avatar', type: 'image' },
    { key: 'name', label: 'Name' },
    { key: 'status', label: 'Status' },
    { key: 'species', label: 'Species' },
    { key: 'gender', label: 'Gender' },
    { key: 'episodeCount', label: 'Episodes' }
  ];

  characters: Character[] = [];
  page = 1;
  totalPages = 1;
  totalCount = 0;
  loading = false;
  errorMessage = '';
  viewMode: 'table' | 'grid' = 'table';
  private currentSearch = '';

  constructor() {
    this.searchControl.valueChanges.pipe(
      startWith(this.searchControl.value),
      debounceTime(300),
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((term) => {
      this.currentSearch = term.trim();
      this.loadPage(1);
    });
  }

  get tableRows(): Record<string, unknown>[] {
    return this.characters.map((character) => ({
      id: character.id,
      image: character.image,
      name: character.name,
      status: character.status,
      species: character.species,
      gender: character.gender,
      episodeCount: character.episode.length
    }));
  }

  loadPage(page: number): void {
    this.page = page;
    this.loading = true;
    this.errorMessage = '';

    this.api.getCharacters(this.currentSearch,page).pipe(
      // switchMap in the search stream is unnecessary here because each load is initiated
      // by a simple method; the component is still cleaned up by takeUntilDestroyed below.
      takeUntilDestroyed(this.destroyRef),
      finalize(() => this.loading = false),
      catchError(() => {
        this.errorMessage = 'Could not load characters. Please check your connection and try again.';
        this.characters = [];
        this.totalCount = 0;
        this.totalPages = 1;
        return of(null);
      })
    ).subscribe((response) => {
      if (!response) return;
      this.characters = response.results;
      this.totalCount = response.info.count;
      this.totalPages = response.info.pages;
    });
  }

  openCharacter(row: Record<string, unknown> | Character): void {
    const id = Number(row['id']);
    if (id) void this.router.navigate(['/characters', id]);
  }
}