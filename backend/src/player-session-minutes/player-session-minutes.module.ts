import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  PlayerEntity,
  PlayerSessionMinutesEntity,
  SessionEntity,
} from '../entities';
import { PlayerSessionMinutesController } from './player-session-minutes.controller';
import { PlayerSessionMinutesService } from './player-session-minutes.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PlayerSessionMinutesEntity,
      PlayerEntity,
      SessionEntity,
    ]),
  ],
  controllers: [PlayerSessionMinutesController],
  providers: [PlayerSessionMinutesService],
})
export class PlayerSessionMinutesModule {}
