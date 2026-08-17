import { classifyTeamCatalogV2Action } from './team-catalog-v2.constants';

describe('classifyTeamCatalogV2Action', () => {
  it('classifies every attack action as offensive', () => {
    expect(classifyTeamCatalogV2Action('TEAM_V2_ATTACK', 'LOW_BLOCK')).toBe(
      'offensive',
    );
  });

  it('classifies every defense action as defensive', () => {
    expect(
      classifyTeamCatalogV2Action('TEAM_V2_DEFENSE', 'POSITIONAL_ATTACK'),
    ).toBe('defensive');
  });

  it.each(['CORNER', 'OFFENSIVE_KICK_IN', 'FREE_KICK'])(
    'classifies set-piece context %s as offensive',
    (contextKey) => {
      expect(classifyTeamCatalogV2Action('TEAM_V2_SET_PIECE', contextKey)).toBe(
        'offensive',
      );
    },
  );

  it.each(['DEFENSIVE_KICK_IN', 'GOAL_CLEARANCE'])(
    'classifies set-piece context %s as defensive',
    (contextKey) => {
      expect(classifyTeamCatalogV2Action('TEAM_V2_SET_PIECE', contextKey)).toBe(
        'defensive',
      );
    },
  );

  it('does not classify legacy categories or incomplete v2 set pieces', () => {
    expect(
      classifyTeamCatalogV2Action('OFFENSIVE_TRANSITION', null),
    ).toBeNull();
    expect(classifyTeamCatalogV2Action('TEAM_V2_SET_PIECE', null)).toBeNull();
  });
});
