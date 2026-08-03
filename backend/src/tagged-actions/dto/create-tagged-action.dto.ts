import { IsInt, IsOptional, Matches, Min } from 'class-validator';

const POSTGRES_ID_PATTERN =
  /^[0-9a-fA-F]{8}(?:-[0-9a-fA-F]{4}){3}-[0-9a-fA-F]{12}$/;

export class CreateTaggedActionDto {
  @Matches(POSTGRES_ID_PATTERN, {
    message: 'Identificador da ação do catálogo deve ser um UUID válido',
  })
  catalogActionId!: string;

  @IsOptional()
  @Matches(POSTGRES_ID_PATTERN, {
    message: 'Identificador do jogador deve ser um UUID válido',
  })
  playerId!: string | null;

  @IsInt({ message: 'Tempo do vídeo deve ser um número inteiro' })
  @Min(0, { message: 'Tempo do vídeo deve ser maior ou igual a zero' })
  timestampSeconds!: number;
}
