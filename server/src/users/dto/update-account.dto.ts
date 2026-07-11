import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateAccountDto {
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Digite seu nome.' })
  name?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Digite um e-mail válido.' })
  email?: string;
}
