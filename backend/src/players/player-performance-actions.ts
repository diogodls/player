import { TaggedActionEntity } from '../entities';

export const PLAYER_ACTION_CATEGORY_KEYS = {
  offensive: [
    'OFFENSIVE_ACTIONS',
    'COURT_GOALS',
    'OFFENSIVE_ORGANIZATION',
    'OFFENSIVE_TRANSITION',
  ],
  defensive: [
    'DEFENSIVE_ACTIONS',
    'COURT_GOALS_CONCEDED',
    'DEFENSIVE_ORGANIZATION',
    'DEFENSIVE_TRANSITION',
  ],
  playingTime: 'PLAYING_TIME',
} as const;

const COURT_EVENT_CODES = new Set(['ENTROU', 'SAIU']);

export function isPerformanceAction(action: TaggedActionEntity): boolean {
  const catalogAction = action.acaoCatalogo;
  if (!catalogAction) return false;

  return (
    catalogAction.categoriaAcao?.chave !==
      PLAYER_ACTION_CATEGORY_KEYS.playingTime &&
    !COURT_EVENT_CODES.has(catalogAction.sigla)
  );
}

export function countActionsByCategoryKeys(
  actions: TaggedActionEntity[],
  categoryKeys: readonly string[],
): number {
  const acceptedKeys = new Set(categoryKeys);
  return actions.filter((action) =>
    acceptedKeys.has(action.acaoCatalogo?.categoriaAcao?.chave ?? ''),
  ).length;
}
