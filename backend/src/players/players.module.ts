import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  PlayerEntity,
  PlayerSessionMinutesEntity,
  TaggedActionEntity,
  TeamEntity,
} from '../entities';
import { PlayerStatisticsService } from './player-statistics.service';
import { PlayersController } from './players.controller';
import { PlayersService } from './players.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PlayerEntity,
      PlayerSessionMinutesEntity,
      TeamEntity,
      TaggedActionEntity,
    ]),
  ],
  controllers: [PlayersController],
  providers: [PlayersService, PlayerStatisticsService],
  exports: [PlayersService, PlayerStatisticsService],
})
export class PlayersModule {}
