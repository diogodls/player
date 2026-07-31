import { CoachDashboardController } from './coach-dashboard.controller';
import { CoachDashboardService } from './coach-dashboard.service';
describe('CoachDashboardController', () => {
  it('delegates the request to the service', () => {
    const response = {
      averageTeamCards: [],
      metrics: [],
      players: [],
      teamIndexes: [],
    };
    const getDashboard = jest.fn().mockReturnValue(response);
    const controller = new CoachDashboardController({
      getDashboard,
    } as unknown as CoachDashboardService);
    expect(controller.findOne()).toBe(response);
    expect(getDashboard).toHaveBeenCalledTimes(1);
  });
});
