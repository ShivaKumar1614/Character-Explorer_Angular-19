import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of, throwError } from 'rxjs';
import { CharacterResponse, Character, Episode } from '../models/character.model';

@Injectable({ providedIn: 'root' })
export class RestApiService {
  private http = inject(HttpClient);
  private api = 'https://rickandmortyapi.com/api';

  // page starts from 1 (API rule)
  getCharacters(name: string, page: number): Observable<CharacterResponse> {
    const params = new HttpParams().set('name', name).set('page', page);

    return this.http.get<CharacterResponse>(`${this.api}/character`, { params }).pipe(
      // API returns 404 when nothing matches the search -> show empty table
      catchError((err) =>
        err.status === 404
          ? of({ info: { count: 0, pages: 0 }, results: [] })
          : throwError(() => err)
      )
    );
  }

  getCharacter(id: string): Observable<Character> {
    return this.http.get<Character>(`${this.api}/character/${id}`);
  }

  // API accepts many ids: /episode/1,2,3 (but returns a single object for one id)
  getEpisodes(ids: number[]): Observable<Episode[]> {
    if (ids.length === 0) return of([]);
    return this.http
      .get<Episode | Episode[]>(`${this.api}/episode/${ids.join(',')}`)
      .pipe(map((res) => (Array.isArray(res) ? res : [res])));
  }
}
