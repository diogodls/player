export type SessionType = "Treino" | "Jogo";

export type SessionData = {
  id: string;
  type: SessionType;
  date: string;
  local: string;
  description?: string;
  opponent?: string;
};
