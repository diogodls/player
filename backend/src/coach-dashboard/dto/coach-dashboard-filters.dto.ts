import { IsDateString, IsOptional, IsUUID } from 'class-validator';

export class CoachDashboardFiltersDto {
  @IsOptional()
  @IsUUID('4', { message: 'Sessao invalida' })
  sessionId?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Data inicial invalida' })
  startDate?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Data final invalida' })
  endDate?: string;
}
