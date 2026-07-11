import { IsBoolean, IsEnum, IsOptional } from 'class-validator';
import { VideoQuality } from '../../generated/prisma/enums';

export class UpdatePreferencesDto {
  @IsOptional()
  @IsBoolean()
  autoplay?: boolean;

  @IsOptional()
  @IsBoolean()
  previews?: boolean;

  @IsOptional()
  @IsBoolean()
  subtitles?: boolean;

  @IsOptional()
  @IsBoolean()
  releaseNotifications?: boolean;

  @IsOptional()
  @IsEnum(VideoQuality)
  videoQuality?: VideoQuality;
}
