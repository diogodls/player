import { Transform } from 'class-transformer';
import { IsDateString, IsIn, IsInt, IsOptional } from 'class-validator';
import { SESSION_TYPE_IDS } from '../sessions.constants';
import { toOptionalNumber } from './session-dto.utils';

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
}
