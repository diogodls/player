import { Transform } from 'class-transformer';
import {
  IsDateString,
  IsDefined,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import {
  SESSION_COURT_SIZE_IDS,
  SESSION_LOCATION_IDS,
  SESSION_TYPE_IDS,
} from '../sessions.constants';
import { trimString } from './session-dto.utils';

export class SessionDto {
  @ValidateIf((_, value: unknown) => value !== null)
  @IsDefined({ message: 'Identificador da sessao e obrigatorio' })
  @IsUUID(undefined, {
    message: 'Identificador da sessao deve ser um UUID valido',
  })
  id!: string | null;

  @IsInt({ message: 'Identificador do tipo deve ser um numero inteiro' })
  @IsIn(SESSION_TYPE_IDS, { message: 'Tipo de sessao invalido' })
  typeId!: number;

  @IsInt({ message: 'Identificador do local deve ser um numero inteiro' })
  @IsIn(SESSION_LOCATION_IDS, { message: 'Local da sessao invalido' })
  locationId!: number;

  @IsInt({
    message: 'Identificador do tamanho da quadra deve ser um numero inteiro',
  })
  @IsIn(SESSION_COURT_SIZE_IDS, {
    message: 'Tamanho da quadra invalido',
  })
  courtSizeId!: number;

  @IsDateString({}, { message: 'Data deve ser uma data valida' })
  date!: string;

  @Transform(trimString)
  @IsOptional()
  @IsString({ message: 'Descricao deve ser um texto' })
  @IsNotEmpty({ message: 'Descricao nao pode ser vazia' })
  @MaxLength(1000, { message: 'Descricao deve ter no maximo 1000 caracteres' })
  description?: string;
}
