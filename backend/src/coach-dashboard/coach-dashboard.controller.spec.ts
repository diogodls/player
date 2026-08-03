import { CoachDashboardController } from './coach-dashboard.controller';
import { CoachDashboardService } from './coach-dashboard.service';
describe('CoachDashboardController', () => {
  it('delegates the filters to the service and returns its response', async () => {
    const response = {
      metrics: [],
      players: [],
      teamIndexes: [],
    };
    const filters = { sessionId: '79fbbbe8-39b1-4b25-bd11-236a0f228cb0' };
    const getDashboard = jest.fn().mockResolvedValue(response);
    const controller = new CoachDashboardController({
      getDashboard,
    } as unknown as CoachDashboardService);
    await expect(controller.findOne(filters)).resolves.toBe(response);
    expect(getDashboard).toHaveBeenCalledTimes(1);
    expect(getDashboard).toHaveBeenCalledWith(filters);
  });
});
