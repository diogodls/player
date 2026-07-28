import { IsInt, IsOptional, IsUUID, Min } from 'class-validator';

export class CreateTaggedActionDto {
  @IsUUID(undefined, {
    message: 'Identificador da ação do catálogo deve ser um UUID válido',
  })
  catalogActionId!: string;

  @IsOptional()
  @IsUUID(undefined, {
    message: 'Identificador do jogador deve ser um UUID válido',
  })
  playerId!: string | null;

  @IsInt({ message: 'Tempo do vídeo deve ser um número inteiro' })
  @Min(0, { message: 'Tempo do vídeo deve ser maior ou igual a zero' })
  timestampSeconds!: number;
}
