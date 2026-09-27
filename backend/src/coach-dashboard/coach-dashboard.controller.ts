import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { CoachDashboardService } from './coach-dashboard.service';
import { CoachDashboardFiltersDto } from './dto/coach-dashboard-filters.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthenticatedUser } from '../auth/authenticated-user.interface';
@UseGuards(JwtAuthGuard)
@Controller('coach-dashboard')
export class CoachDashboardController {
  constructor(private readonly coachDashboardService: CoachDashboardService) {}
  @Get()
  findOne(
    @CurrentUser() userOrFilters: AuthenticatedUser | CoachDashboardFiltersDto,
    @Query() maybeFilters?: CoachDashboardFiltersDto,
  ) {
    return 'equipeId' in userOrFilters
      ? this.coachDashboardService.getDashboard(
          userOrFilters.equipeId,
          maybeFilters,
        )
      : this.coachDashboardService.getDashboard(userOrFilters);
  }
}
