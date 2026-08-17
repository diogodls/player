import type { ActionTagged } from "../pages/Analysis";
import { backendApi } from "./api";

const POSTGRES_ID_PATTERN =
  /^[0-9a-fA-F]{8}(?:-[0-9a-fA-F]{4}){3}-[0-9a-fA-F]{12}$/;

export type PersistedSessionAction = {
  id: string;
  sessionId: string;
  catalogActionId: string;
  playerId: string | null;
  teamContextId: string | null;
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

      const baseAction = {
        clientActionId: action.id,
        catalogActionId: action.catalogActionId,
        timestampSeconds,
      };

      if (action.type === "team") {
        if (
          action.teamContextId &&
          !POSTGRES_ID_PATTERN.test(action.teamContextId)
        ) {
          throw new Error("Identificador do contexto de equipe inválido");
        }
        return {
          ...baseAction,
          ...(action.teamContextId
            ? { teamContextId: action.teamContextId }
            : {}),
        };
      }

      return { ...baseAction, playerId };
    }),
  };

  const response = await backendApi.post<{ actions: PersistedSessionAction[] }>(
    `/sessions/${sessionId}/actions`,
    payload,
  );
  return response.data.actions;
}
