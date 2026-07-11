import { IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';
import type { ApiMediaType } from '../../catalog/types/catalog.types';

export class RecordHistoryDto {
  @IsString()
  profileId!: string;

  @IsIn(['movie', 'tv'])
  mediaType!: ApiMediaType;

  @IsInt()
  @Min(1)
  tmdbId!: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  seasonNumber?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  episodeNumber?: number;
}
