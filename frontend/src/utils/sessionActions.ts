import type { ActionTagged } from "../pages/Analysis";
import { backendApi } from "./api";

const POSTGRES_ID_PATTERN =
  /^[0-9a-fA-F]{8}(?:-[0-9a-fA-F]{4}){3}-[0-9a-fA-F]{12}$/;

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
      if (
        !action.catalogActionId ||
        !POSTGRES_ID_PATTERN.test(action.catalogActionId)
      ) {
        throw new Error("Identificador da ação do catálogo inválido");
      }
      const timestampSeconds = Math.floor(Number(action.time));
      if (!Number.isFinite(timestampSeconds) || timestampSeconds < 0) {
        throw new Error("Ação com tempo de vídeo inválido");
      }

      const playerId = action.player ? String(action.player.id) : null;
      if (action.type === "individual" && !playerId) {
        throw new Error("Ação individual deve possuir um jogador");
      }
      if (playerId && !POSTGRES_ID_PATTERN.test(playerId)) {
        throw new Error("Identificador do jogador inválido");
      }
      if (action.type === "team" && playerId) {
        throw new Error("Ação coletiva não deve possuir um jogador");
      }

      return {
        clientActionId: action.id,
        catalogActionId: action.catalogActionId,
        playerId,
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
