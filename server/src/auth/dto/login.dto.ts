import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Digite um e-mail válido.' })
  email!: string;

  @IsString()
  @MinLength(6, { message: 'A senha precisa de pelo menos 6 caracteres.' })
  password!: string;
}
