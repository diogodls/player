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
} from '@nestjs/common';
import { SessionFiltersDto } from './dto/session-filters.dto';
import { SessionViewFiltersDto } from './dto/session-view-filters.dto';
import { SessionDto } from './dto/session.dto';
import { SessionsService } from './sessions.service';

@Controller('sessions')
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Get()
  findAll(@Query() filters: SessionFiltersDto) {
    return this.sessionsService.findAll(filters);
  }

  @Get(':id/rankings/:indexKey')
  findRanking(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Param('indexKey') indexKey: string,
  ) {
    return this.sessionsService.findRanking(id, indexKey);
  }

  @Get(':id/view/filters')
  findViewFilters(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.sessionsService.findViewFilters(id);
  }

  @Get(':id/view')
  findView(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Query() filters: SessionViewFiltersDto,
  ) {
    return this.sessionsService.findView(id, filters);
  }

  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.sessionsService.findOne(id);
  }

  @Post()
  create(@Body() dto: SessionDto) {
    return this.sessionsService.create(dto);
  }

  @Put(':id')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: SessionDto,
  ) {
    return this.sessionsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.sessionsService.remove(id);
  }
}
