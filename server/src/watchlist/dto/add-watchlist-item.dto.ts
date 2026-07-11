import { IsIn, IsInt, IsString, Min } from 'class-validator';
import type { ApiMediaType } from '../../catalog/types/catalog.types';

export class AddWatchlistItemDto {
  @IsString()
  profileId!: string;

  @IsIn(['movie', 'tv'])
  mediaType!: ApiMediaType;

  @IsInt()
  @Min(1)
  tmdbId!: number;
}
