import { Module } from '@nestjs/common';
import { CoachDashboardController } from './coach-dashboard.controller';
import { CoachDashboardService } from './coach-dashboard.service';
@Module({
  controllers: [CoachDashboardController],
  providers: [CoachDashboardService],
})
export class CoachDashboardModule {}
