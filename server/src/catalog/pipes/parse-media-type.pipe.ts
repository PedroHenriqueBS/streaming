import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { ApiMediaType } from '../types/catalog.types';

@Injectable()
export class ParseMediaTypePipe implements PipeTransform<string, ApiMediaType> {
  transform(value: string): ApiMediaType {
    if (value !== 'movie' && value !== 'tv') {
      throw new BadRequestException('Tipo de mídia inválido. Use "movie" ou "tv".');
    }
    return value;
  }
}
