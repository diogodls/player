import { Transform } from 'class-transformer';
import { IsIn, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { trimString } from './session-dto.utils';

export class SessionViewFiltersDto {
  @IsOptional()
  @IsIn(['positive', 'negative'], { message: 'Resultado invalido' })
  outcome?: 'positive' | 'negative';

  @IsOptional()
  @IsUUID(undefined, {
    message: 'Identificador do jogador deve ser um UUID valido',
  })
  playerId?: string;

  @Transform(trimString)
  @IsOptional()
  @IsString({ message: 'Categoria deve ser um texto' })
  @MaxLength(30, { message: 'Categoria deve ter no maximo 30 caracteres' })
  categoryCode?: string;
}
