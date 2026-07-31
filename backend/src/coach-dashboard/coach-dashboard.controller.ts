import { Controller, Get } from '@nestjs/common';
import { CoachDashboardService } from './coach-dashboard.service';
@Controller('coach-dashboard')
export class CoachDashboardController {
  constructor(private readonly coachDashboardService: CoachDashboardService) {}
  @Get()
  findOne() {
    return this.coachDashboardService.getDashboard();
  }
}
