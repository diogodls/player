import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  Put,
} from '@nestjs/common';
import { PlayerFiltersDto } from './dto/player-filters.dto';
import { PlayerDto } from './dto/player.dto';
import { PlayersService } from './players.service';
import { CoachDashboardFiltersDto } from '../coach-dashboard/dto/coach-dashboard-filters.dto';

@Controller('players')
export class PlayersController {
  constructor(private readonly playersService: PlayersService) {}

  @Get()
  findAll(@Query() filters: PlayerFiltersDto) {
    return this.playersService.findAll(filters);
  }

  @Get('rankings')
  findRankingOptions() {
    return this.playersService.findRankingOptions();
  }

  @Get('rankings/:indexKey')
  findRanking(
    @Param('indexKey') indexKey: string,
    @Query() filters: CoachDashboardFiltersDto,
  ) {
    return this.playersService.findRanking(indexKey, filters);
  }

  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.playersService.findOne(id);
  }

  @Post()
  create(@Body() dto: PlayerDto) {
    return this.playersService.create(dto);
  }

  @Put(':id')
  update(@Param('id', new ParseUUIDPipe()) id: string, @Body() dto: PlayerDto) {
    return this.playersService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.playersService.remove(id);
  }
}
