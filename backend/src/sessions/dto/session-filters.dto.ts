import { Transform } from 'class-transformer';
import {
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  Max,
  Min,
} from 'class-validator';
import { SESSION_LOCATION_IDS, SESSION_TYPE_IDS } from '../sessions.constants';
import { toOptionalNumber } from './session-dto.utils';

export class SessionFiltersDto {
  @Transform(({ value }: { value: unknown }) => toOptionalNumber(value))
  @IsOptional()
  @IsInt({ message: 'Identificador do tipo deve ser um numero inteiro' })
  @IsIn(SESSION_TYPE_IDS, { message: 'Tipo de sessao invalido' })
  typeId?: number;

  @Transform(({ value }: { value: unknown }) => toOptionalNumber(value))
  @IsOptional()
  @IsInt({ message: 'Identificador do local deve ser um numero inteiro' })
  @IsIn(SESSION_LOCATION_IDS, { message: 'Local da sessao invalido' })
  locationId?: number;

  @IsOptional()
  @IsDateString({}, { message: 'Data deve ser uma data valida' })
  date?: string;

  @Transform(({ value }: { value: unknown }) => toOptionalNumber(value))
  @IsOptional()
  @IsInt({ message: 'Pagina deve ser um numero inteiro' })
  @Min(1, { message: 'Pagina deve ser maior que zero' })
  page = 1;

  @Transform(({ value }: { value: unknown }) => toOptionalNumber(value))
  @IsOptional()
  @IsInt({ message: 'Limite deve ser um numero inteiro' })
  @Min(1, { message: 'Limite deve ser maior que zero' })
  @Max(100, { message: 'Limite deve ser menor ou igual a 100' })
  limit = 5;
}
