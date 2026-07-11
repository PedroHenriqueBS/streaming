import {
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const DEFAULT_LANGUAGE = 'pt-BR';

export type TmdbQueryParams = Record<string, string | number | undefined>;

@Injectable()
export class TmdbClient {
  private readonly logger = new Logger(TmdbClient.name);

  constructor(private readonly configService: ConfigService) {}

  get isConfigured(): boolean {
    return this.configService.get<string>('TMDB_API_TOKEN', '') !== '';
  }

  async get<T>(path: string, params: TmdbQueryParams = {}): Promise<T> {
    if (!this.isConfigured) {
      throw new ServiceUnavailableException(
        'Catálogo indisponível: configure TMDB_API_TOKEN no servidor.',
      );
    }

    const url = new URL(`${TMDB_BASE_URL}${path}`);
    url.searchParams.set('language', DEFAULT_LANGUAGE);
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    }

    let response: Response;
    try {
      response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${this.configService.getOrThrow<string>('TMDB_API_TOKEN')}`,
          Accept: 'application/json',
        },
      });
    } catch (error) {
      this.logger.error(`Falha de rede ao consultar TMDB ${path}: ${String(error)}`);
      throw new ServiceUnavailableException('Não foi possível consultar o catálogo agora.');
    }

    if (response.status === 404) {
      throw new NotFoundException('Título não encontrado.');
    }
    if (response.status === 401) {
      this.logger.error('TMDB rejeitou o token (401). Verifique TMDB_API_TOKEN.');
      throw new ServiceUnavailableException('Catálogo indisponível: chave do TMDB inválida.');
    }
    if (!response.ok) {
      this.logger.error(`TMDB respondeu ${response.status} para ${path}`);
      throw new ServiceUnavailableException('O catálogo está temporariamente indisponível.');
    }

    return (await response.json()) as T;
  }
}
