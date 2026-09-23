import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class UpdatePasswordDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(6, { message: 'Senha deve ter ao menos 6 caracteres.' })
  password!: string;
}
