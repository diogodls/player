import { Transform } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';
import { PLAYER_POSITION_IDS, PREFERRED_SIDE_IDS } from '../players.constants';
import { trimString } from './player-dto.utils';

export class CreatePlayerDto {
  @Transform(trimString)
  @IsString({ message: 'Nome deve ser um texto' })
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  @MaxLength(255, { message: 'Nome deve ter no máximo 255 caracteres' })
  name!: string;

  @IsInt({ message: 'Idade deve ser um número inteiro' })
  @Min(1, { message: 'Idade deve ser maior que zero' })
  age!: number;

  @IsInt({ message: 'Identificador da posição deve ser um número inteiro' })
  @IsIn(PLAYER_POSITION_IDS, { message: 'Posição inválida' })
  positionId!: number;

  @IsOptional()
  @IsUUID(undefined, {
    message: 'Identificador da equipe deve ser um UUID válido',
  })
  teamId?: string;

  @IsInt({
    message: 'Identificador do lado preferencial deve ser um número inteiro',
  })
  @IsIn(PREFERRED_SIDE_IDS, { message: 'Lado preferencial inválido' })
  preferredSideId!: number;
}
