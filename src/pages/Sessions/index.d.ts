export type SessionType = "Treino" | "Jogo";

export type SessionData = Session[];

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

export type SessionAnalysisSection = {
  summary: SessionSummary;
  entities: SessionEntity[];
};

export type SessionViewData = {
  session: Session;
  analysis: {
    individual: SessionAnalysisSection;
    team: SessionAnalysisSection;
  };
};

export type SessionViewRecordData = Record<string, SessionViewData>; //todo: remover isso daqui quando tiver back