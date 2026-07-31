import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaggedActionEntity, TeamEntity } from '../entities';
import { CoachDashboardController } from './coach-dashboard.controller';
import { CoachDashboardService } from './coach-dashboard.service';
@Module({
  imports: [TypeOrmModule.forFeature([TaggedActionEntity, TeamEntity])],
  controllers: [CoachDashboardController],
  providers: [CoachDashboardService],
})
export class CoachDashboardModule {}
