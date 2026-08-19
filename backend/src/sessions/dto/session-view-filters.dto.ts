import { Transform } from 'class-transformer';
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import { trimString } from './session-dto.utils';

function toOptionalString(value: unknown): unknown {
  return value === undefined || value === '' ? undefined : value;
}

export class SessionViewFiltersDto {
  @IsOptional()
  @IsIn(['positive', 'negative', 'neutral'], { message: 'Resultado invalido' })
  outcome?: 'positive' | 'negative' | 'neutral';

  @Transform(({ value }: { value: unknown }) => toOptionalString(value))
  @IsOptional()
  @IsString({ message: 'Identificador do jogador deve ser um texto' })
  @MaxLength(255, {
    message: 'Identificador do jogador deve ter no maximo 255 caracteres',
  })
  playerId?: string;

  @Transform(({ value }: { value: unknown }) =>
    toOptionalString(trimString({ value })),
  )
  @IsOptional()
  @IsString({ message: 'Categoria deve ser um texto' })
  @MaxLength(30, { message: 'Categoria deve ter no maximo 30 caracteres' })
  categoryCode?: string;

  @Transform(({ value }: { value: unknown }) =>
    toOptionalString(trimString({ value })),
  )
  @IsOptional()
  @IsString({ message: 'Fase deve ser um texto' })
  @MaxLength(50, { message: 'Fase deve ter no maximo 50 caracteres' })
  phaseKey?: string;
}
