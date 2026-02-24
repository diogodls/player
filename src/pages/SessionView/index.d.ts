export type SessionType = "Treino" | "Jogo";

export type SessionData = {
  sessions: Session[];
};

export type Session = {
  id: string;
  type: SessionType;
  date: string;
  local: string;
  description?: string;
  opponent?: string;
}

export type SessionMeta = {
  type: SessionType;
  date: string;
  local: string;
  description?: string;
  opponent?: string;
};