import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlayerEntity, TaggedActionEntity, TeamEntity } from '../entities';
import { PlayerStatisticsService } from './player-statistics.service';
import { PlayersController } from './players.controller';
import { PlayersService } from './players.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([PlayerEntity, TeamEntity, TaggedActionEntity]),
  ],
  controllers: [PlayersController],
  providers: [PlayersService, PlayerStatisticsService],
})
export class PlayersModule {}
