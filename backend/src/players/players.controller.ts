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
  UseGuards,
} from '@nestjs/common';
import { PlayerFiltersDto } from './dto/player-filters.dto';
import { PlayerDto } from './dto/player.dto';
import { PlayersService } from './players.service';
import { CoachDashboardFiltersDto } from '../coach-dashboard/dto/coach-dashboard-filters.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthenticatedUser } from '../auth/authenticated-user.interface';

@UseGuards(JwtAuthGuard)
@Controller('players')
export class PlayersController {
  constructor(private readonly playersService: PlayersService) {}

  @Get()
  findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query() filters: PlayerFiltersDto,
  ) {
    return this.playersService.findAll(user.equipeId, filters);
  }

  @Get('rankings')
  findRankingOptions() {
    return this.playersService.findRankingOptions();
  }

  @Get('rankings/:indexKey')
  findRanking(
    @CurrentUser() user: AuthenticatedUser,
    @Param('indexKey') indexKey: string,
    @Query() filters: CoachDashboardFiltersDto,
  ) {
    return this.playersService.findRanking(user.equipeId, indexKey, filters);
  }

  @Get(':id')
  findOne(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    return this.playersService.findOne(user.equipeId, id);
  }

  @Post()
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: PlayerDto) {
    return this.playersService.create(user.equipeId, dto);
  }

  @Put(':id')
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: PlayerDto,
  ) {
    return this.playersService.update(user.equipeId, id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    return this.playersService.remove(user.equipeId, id);
  }
}
