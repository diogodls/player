import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  Res,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import type { Response } from 'express';
import { SessionFiltersDto } from './dto/session-filters.dto';
import { SessionComparisonFiltersDto } from './dto/session-comparison-filters.dto';
import { SessionViewFiltersDto } from './dto/session-view-filters.dto';
import { SessionDto } from './dto/session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { SessionsService } from './sessions.service';
import type { SessionComparisonCsvKind } from './sessions.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthenticatedUser } from '../auth/authenticated-user.interface';

@UseGuards(JwtAuthGuard)
@Controller('sessions')
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Get()
  findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query() filters: SessionFiltersDto,
  ) {
    return this.sessionsService.findAll(user.equipeId, filters);
  }

  @Get('comparison')
  compare(
    @CurrentUser() user: AuthenticatedUser,
    @Query() filters: SessionComparisonFiltersDto,
  ) {
    return this.sessionsService.compare(user.equipeId, filters);
  }

  @Get('comparison/export/:kind')
  async exportComparisonCsv(
    @CurrentUser() user: AuthenticatedUser,
    @Param('kind') kind: string,
    @Query() filters: SessionComparisonFiltersDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    if (kind !== 'players' && kind !== 'team') {
      throw new BadRequestException('Tipo de exportacao invalido');
    }

    const csv = await this.sessionsService.exportComparisonCsv(
      user.equipeId,
      filters,
      kind as SessionComparisonCsvKind,
    );
    const suffix = kind === 'players' ? 'jogadores' : 'equipe';
    const period = `${filters.startDate}-a-${filters.endDate}`;
    response.setHeader('Content-Type', 'text/csv; charset=utf-8');
    response.setHeader(
      'Content-Disposition',
      `attachment; filename="comparacao-${suffix}-${period}.csv"`,
    );

    return csv;
  }

  @Get(':id/rankings/:indexKey')
  findRanking(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Param('indexKey') indexKey: string,
  ) {
    return this.sessionsService.findRanking(user.equipeId, id, indexKey);
  }

  @Get(':id/view/filters')
  findViewFilters(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    return this.sessionsService.findViewFilters(user.equipeId, id);
  }

  @Get(':id/view')
  findView(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Query() filters: SessionViewFiltersDto,
  ) {
    return this.sessionsService.findView(user.equipeId, id, filters);
  }

  @Get(':id')
  findOne(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    return this.sessionsService.findOne(user.equipeId, id);
  }

  @Post()
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: SessionDto) {
    return this.sessionsService.create(user.equipeId, dto);
  }

  @Put(':id')
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateSessionDto,
  ) {
    return this.sessionsService.update(user.equipeId, id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    return this.sessionsService.remove(user.equipeId, id);
  }
}
