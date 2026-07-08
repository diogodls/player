import { Transform } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, MaxLength } from 'class-validator';
import { PLAYER_POSITION_IDS } from '../players.constants';
import { trimString } from './player-dto.utils';

export class PlayerFiltersDto {
  @Transform(trimString)
  @IsOptional()
  @IsString({ message: 'Nome deve ser um texto' })
  @MaxLength(255, { message: 'Nome deve ter no máximo 255 caracteres' })
  name?: string;

  @Transform(({ value }: { value: unknown }) =>
    value === undefined || value === '' ? undefined : Number(value),
  )
  @IsOptional()
  @IsInt({ message: 'Identificador da posição deve ser um número inteiro' })
  @IsIn(PLAYER_POSITION_IDS, { message: 'Posição inválida' })
  positionId?: number;
}
