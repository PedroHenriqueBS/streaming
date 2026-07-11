import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';

interface TmdbGenre {
  id: number;
  name: string;
}

const FALLBACK_GENRES: TmdbGenre[] = [
  { id: 28, name: 'Ação' },
  { id: 12, name: 'Aventura' },
  { id: 16, name: 'Animação' },
  { id: 35, name: 'Comédia' },
  { id: 80, name: 'Crime' },
  { id: 99, name: 'Documentário' },
  { id: 18, name: 'Drama' },
  { id: 10751, name: 'Família' },
  { id: 14, name: 'Fantasia' },
  { id: 36, name: 'História' },
  { id: 27, name: 'Terror' },
  { id: 10402, name: 'Música' },
  { id: 9648, name: 'Mistério' },
  { id: 10749, name: 'Romance' },
  { id: 878, name: 'Ficção científica' },
  { id: 10770, name: 'Cinema TV' },
  { id: 53, name: 'Thriller' },
  { id: 10752, name: 'Guerra' },
  { id: 37, name: 'Faroeste' },
  { id: 10759, name: 'Ação e Aventura' },
  { id: 10762, name: 'Infantil' },
  { id: 10763, name: 'Notícias' },
  { id: 10764, name: 'Reality' },
  { id: 10765, name: 'Sci-Fi e Fantasia' },
  { id: 10766, name: 'Novela' },
  { id: 10767, name: 'Talk Show' },
  { id: 10768, name: 'Guerra e Política' },
];

async function fetchGenresFromTmdb(token: string): Promise<TmdbGenre[]> {
  const headers = { Authorization: `Bearer ${token}` };
  const urls = [
    'https://api.themoviedb.org/3/genre/movie/list?language=pt-BR',
    'https://api.themoviedb.org/3/genre/tv/list?language=pt-BR',
  ];
  const responses = await Promise.all(urls.map((url) => fetch(url, { headers })));
  for (const response of responses) {
    if (!response.ok) {
      throw new Error(`TMDB respondeu ${response.status}`);
    }
  }
  const payloads = (await Promise.all(responses.map((r) => r.json()))) as {
    genres: TmdbGenre[];
  }[];
  const byId = new Map<number, TmdbGenre>();
  for (const payload of payloads) {
    for (const genre of payload.genres) {
      byId.set(genre.id, genre);
    }
  }
  return [...byId.values()];
}

async function main(): Promise<void> {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter });

  let genres = FALLBACK_GENRES;
  const token = process.env.TMDB_API_TOKEN;
  if (token) {
    try {
      genres = await fetchGenresFromTmdb(token);
      console.log(`Gêneros carregados do TMDB: ${genres.length}`);
    } catch (error) {
      console.warn(`Falha ao consultar o TMDB (${String(error)}); usando lista estática.`);
    }
  } else {
    console.log('TMDB_API_TOKEN não configurado; usando lista estática de gêneros.');
  }

  for (const genre of genres) {
    await prisma.genre.upsert({
      where: { tmdbId: genre.id },
      update: { name: genre.name },
      create: { tmdbId: genre.id, name: genre.name },
    });
  }
  console.log(`Seed concluído: ${genres.length} gêneros.`);

  await prisma.$disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
