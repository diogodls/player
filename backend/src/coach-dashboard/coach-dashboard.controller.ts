import { Controller, Get, Query } from '@nestjs/common';
import { CoachDashboardService } from './coach-dashboard.service';
import { CoachDashboardFiltersDto } from './dto/coach-dashboard-filters.dto';
@Controller('coach-dashboard')
export class CoachDashboardController {
  constructor(private readonly coachDashboardService: CoachDashboardService) {}
  @Get()
  findOne(@Query() filters: CoachDashboardFiltersDto) {
    return this.coachDashboardService.getDashboard(filters);
  }
}
