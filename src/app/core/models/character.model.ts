export type Role = 'admin' | 'viewer';

export interface Character {
  id: number;
  name: string;
  status: string;
  species: string;
  gender: string;
  image: string;
  episode: string[]; // list of episode urls
}

export interface CharacterResponse {
  info: { count: number; pages: number };
  results: Character[];
}

export interface Episode {
  id: number;
  name: string;
  air_date: string;
  episode: string;
}
