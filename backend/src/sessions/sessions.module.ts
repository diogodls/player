import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  PlayerSessionMinutesEntity,
  SessionEntity,
  TaggedActionEntity,
  TeamEntity,
} from '../entities';
import { PlayersModule } from '../players/players.module';
import { SessionsController } from './sessions.controller';
import { SessionsService } from './sessions.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PlayerSessionMinutesEntity,
      SessionEntity,
      TeamEntity,
      TaggedActionEntity,
    ]),
    PlayersModule,
  ],
  controllers: [SessionsController],
  providers: [SessionsService],
})
export class SessionsModule {}
