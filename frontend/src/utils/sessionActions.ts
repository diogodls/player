import type { ActionTagged } from '../pages/Analysis';
import { backendApi } from './api';

export type PersistedSessionAction = {
  id: string;
  sessionId: string;
  catalogActionId: string;
  playerId: string | null;
  timestampSeconds: number;
};

export async function persistSessionActions(
  sessionId: string,
  actions: ActionTagged[],
): Promise<PersistedSessionAction[]> {
  const payload = {
    actions: actions.map((action) => {
      if (!action.catalogActionId) {
        throw new Error('Ação sem identificador do catálogo');
      }
      const timestampSeconds = Math.floor(Number(action.time));
      if (!Number.isFinite(timestampSeconds) || timestampSeconds < 0) {
        throw new Error('Ação com tempo de vídeo inválido');
      }

      return {
        catalogActionId: action.catalogActionId,
        playerId: action.player ? String(action.player.id) : null,
        timestampSeconds,
      };
    }),
  };

  const response = await backendApi.post<{ actions: PersistedSessionAction[] }>(
    `/sessions/${sessionId}/actions`,
    payload,
  );
  return response.data.actions;
}
