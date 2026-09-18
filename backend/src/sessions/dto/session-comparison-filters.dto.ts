import { Transform } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  IsUUID,
} from 'class-validator';
import { SESSION_TYPE_IDS } from '../sessions.constants';
import { toOptionalNumber } from './session-dto.utils';

function toOptionalUuidArray(value: unknown): unknown {
  if (value === undefined || value === '') return undefined;
  const values = Array.isArray(value)
    ? value.flatMap((item) => String(item).split(','))
    : String(value).split(',');

  return values.filter(Boolean);
}

export class SessionComparisonFiltersDto {
  @IsDateString({}, { message: 'Data inicial deve ser uma data valida' })
  startDate!: string;

  @IsDateString({}, { message: 'Data final deve ser uma data valida' })
  endDate!: string;

  @Transform(({ value }: { value: unknown }) => toOptionalNumber(value))
  @IsOptional()
  @IsInt({ message: 'Identificador do tipo deve ser um numero inteiro' })
  @IsIn(SESSION_TYPE_IDS, { message: 'Tipo de sessao invalido' })
  typeId?: number;

  @Transform(({ value }: { value: unknown }) => toOptionalUuidArray(value))
  @IsOptional()
  @IsArray({ message: 'Sessões selecionadas devem ser uma lista' })
  @IsUUID('all', {
    each: true,
    message: 'Identificador de sessão selecionada inválido',
  })
  sessionIds?: string[];
}
