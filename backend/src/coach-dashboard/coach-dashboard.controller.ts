import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { CoachDashboardService } from './coach-dashboard.service';
import { CoachDashboardFiltersDto } from './dto/coach-dashboard-filters.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
@UseGuards(JwtAuthGuard)
@Controller('coach-dashboard')
export class CoachDashboardController {
  constructor(private readonly coachDashboardService: CoachDashboardService) {}
  @Get()
  findOne(@Query() filters: CoachDashboardFiltersDto) {
    return this.coachDashboardService.getDashboard(filters);
  }
}
