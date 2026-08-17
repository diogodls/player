export const LEGACY_TEAM_CATEGORY_KEYS = [
  'SET_PIECE',
  'OFFENSIVE_ORGANIZATION',
  'OFFENSIVE_TRANSITION',
  'DEFENSIVE_ORGANIZATION',
  'DEFENSIVE_TRANSITION',
] as const;

export const TEAM_CATALOG_V2_CATEGORIES = {
  SET_PIECE: {
    id: '00000000-0000-0000-0000-000000000701',
    key: 'TEAM_V2_SET_PIECE',
    title: 'Bola parada',
  },
  ATTACK: {
    id: '00000000-0000-0000-0000-000000000702',
    key: 'TEAM_V2_ATTACK',
    title: 'Ataque',
  },
  DEFENSE: {
    id: '00000000-0000-0000-0000-000000000703',
    key: 'TEAM_V2_DEFENSE',
    title: 'Defesa',
  },
} as const;

export const TEAM_CATALOG_V2_CATEGORY_KEYS = Object.values(
  TEAM_CATALOG_V2_CATEGORIES,
).map((category) => category.key);

export type TeamActionPhase = 'offensive' | 'defensive';

export const TEAM_CATALOG_V2_OFFENSIVE_CATEGORY_KEYS = new Set<string>([
  TEAM_CATALOG_V2_CATEGORIES.ATTACK.key,
]);

export const TEAM_CATALOG_V2_DEFENSIVE_CATEGORY_KEYS = new Set<string>([
  TEAM_CATALOG_V2_CATEGORIES.DEFENSE.key,
]);

export const TEAM_CATALOG_V2_OFFENSIVE_SET_PIECE_CONTEXT_KEYS = new Set([
  'CORNER',
  'OFFENSIVE_KICK_IN',
  'FREE_KICK',
]);

export const TEAM_CATALOG_V2_DEFENSIVE_SET_PIECE_CONTEXT_KEYS = new Set([
  'DEFENSIVE_KICK_IN',
  'GOAL_CLEARANCE',
]);

const TEAM_CATALOG_V2_TITLES = new Map<string, string>(
  Object.values(TEAM_CATALOG_V2_CATEGORIES).map((category) => [
    category.key,
    category.title,
  ]),
);

export function isTeamCatalogV2CategoryKey(
  key: string | null | undefined,
): boolean {
  return key ? TEAM_CATALOG_V2_TITLES.has(key) : false;
}

export function getTeamCatalogV2Title(key: string): string | undefined {
  return TEAM_CATALOG_V2_TITLES.get(key);
}

export function classifyTeamCatalogV2Action(
  categoryKey: string | null | undefined,
  contextKey: string | null | undefined,
): TeamActionPhase | null {
  if (!categoryKey) return null;
  if (TEAM_CATALOG_V2_OFFENSIVE_CATEGORY_KEYS.has(categoryKey)) {
    return 'offensive';
  }
  if (TEAM_CATALOG_V2_DEFENSIVE_CATEGORY_KEYS.has(categoryKey)) {
    return 'defensive';
  }
  if (categoryKey !== TEAM_CATALOG_V2_CATEGORIES.SET_PIECE.key || !contextKey) {
    return null;
  }
  if (TEAM_CATALOG_V2_OFFENSIVE_SET_PIECE_CONTEXT_KEYS.has(contextKey)) {
    return 'offensive';
  }
  if (TEAM_CATALOG_V2_DEFENSIVE_SET_PIECE_CONTEXT_KEYS.has(contextKey)) {
    return 'defensive';
  }
  return null;
}
