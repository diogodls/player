import { CoachDashboardService } from './coach-dashboard.service';
describe('CoachDashboardService', () => {
  it('returns the complete dashboard contract with valid player UUIDs', () => {
    const result = new CoachDashboardService().getDashboard();
    const uuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    expect(result.averageTeamCards.length).toBeGreaterThan(0);
    expect(result.metrics.length).toBeGreaterThan(0);
    expect(result.players.length).toBeGreaterThan(0);
    expect(result.teamIndexes.length).toBeGreaterThan(0);
    const player = result.players[0];
    expect(player.id).toMatch(uuid);
    expect(typeof player.name).toBe('string');
    expect(typeof player.overall).toBe('number');
    expect(typeof player.position).toBe('string');
    expect(typeof player.minutes).toBe('number');
    expect(typeof player.indexes.radj).toBe('number');
    expect(typeof player.indexes.tid).toBe('number');
  });
});
