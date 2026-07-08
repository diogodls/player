import { Transform } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { PLAYER_POSITION_IDS } from '../players.constants';
import { trimString } from './player-dto.utils';

function toOptionalNumber(value: unknown): unknown {
  return value === undefined || value === '' ? undefined : Number(value);
}

export class PlayerFiltersDto {
  @Transform(trimString)
  @IsOptional()
  @IsString({ message: 'Nome deve ser um texto' })
  @MaxLength(255, { message: 'Nome deve ter no máximo 255 caracteres' })
  name?: string;

  @Transform(({ value }: { value: unknown }) => toOptionalNumber(value))
  @IsOptional()
  @IsInt({ message: 'Identificador da posição deve ser um número inteiro' })
  @IsIn(PLAYER_POSITION_IDS, { message: 'Posição inválida' })
  positionId?: number;

  @Transform(({ value }: { value: unknown }) => toOptionalNumber(value))
  @IsOptional()
  @IsInt({ message: 'Página deve ser um número inteiro' })
  @Min(1, { message: 'Página deve ser maior que zero' })
  page = 1;

  @Transform(({ value }: { value: unknown }) => toOptionalNumber(value))
  @IsOptional()
  @IsInt({ message: 'Limite deve ser um número inteiro' })
  @Min(1, { message: 'Limite deve ser maior que zero' })
  @Max(100, { message: 'Limite deve ser menor ou igual a 100' })
  limit = 8;
}
