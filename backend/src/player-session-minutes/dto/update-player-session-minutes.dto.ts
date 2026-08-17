import { IsInt, Min } from 'class-validator';

export class UpdatePlayerSessionMinutesDto {
  @IsInt({ message: 'Minutagem deve ser um número inteiro' })
  @Min(0, { message: 'Minutagem deve ser maior ou igual a zero' })
  totalSeconds!: number;
}
