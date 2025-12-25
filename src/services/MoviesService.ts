import { httpClient } from "./httpClient";
import type { IPaginatedResponse } from "./types";

interface TData {
  id: number;
  title: string;
  overview: string;
  backdrop_path: string;
  poster_path: string;
  vote_average: number;
  vote_count: number;
  popularity: number;
  adult: boolean;
}

export class MoviesService {
  static async getAll(page = 1, per_page = 20) {
    const { data } = await httpClient.get<IPaginatedResponse<TData>>('movie/now_playing', {
      params: {
        api_key: 'e07f7d1448eee69e641fe73295906b79',
        language: 'pt-BR',
        page: page,
        per_page: per_page,
      }
    })

    return data;
  }
}