import { IsInt, IsString, Max, Min, MinLength } from 'class-validator';

export class CreateProfileDto {
  @IsString()
  @MinLength(2, { message: 'Digite um nome com pelo menos 2 letras.' })
  name!: string;

  @IsInt()
  @Min(0)
  @Max(359)
  avatarHue!: number;
}
