import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SessionEntity, TeamEntity } from '../entities';
import { SessionsController } from './sessions.controller';
import { SessionsService } from './sessions.service';

@Module({
  imports: [TypeOrmModule.forFeature([SessionEntity, TeamEntity])],
  controllers: [SessionsController],
  providers: [SessionsService],
})
export class SessionsModule {}
