import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlayerEntity, TeamEntity } from '../entities';
import { PlayersController } from './players.controller';
import { PlayersService } from './players.service';

@Module({
  imports: [TypeOrmModule.forFeature([PlayerEntity, TeamEntity])],
  controllers: [PlayersController],
  providers: [PlayersService],
})
export class PlayersModule {}
