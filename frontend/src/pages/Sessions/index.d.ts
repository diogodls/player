import type {
  SESSION_COURT_SIZES,
  SESSION_LOCATIONS,
  SESSION_TYPES,
} from "../../constants/sessions";

export type SessionType = (typeof SESSION_TYPES)[number];
export type SessionLocation = (typeof SESSION_LOCATIONS)[number];
export type SessionCourtSize = (typeof SESSION_COURT_SIZES)[number];

export type Session = {
  id: string;
  typeId: number;
  type: SessionType;
  date: string;
  locationId: number;
  local: SessionLocation;
  courtSizeId: number;
  courtSize: SessionCourtSize;
  description?: string | null;
  opponent?: string | null;
};

export type SessionMeta = {
  type: SessionType;
  date: string;
  local: SessionLocation;
  courtSize: SessionCourtSize;
  description: string;
};

export type SessionListResponse = {
  data: Session[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type SessionFilters = {
  type: "all" | SessionType;
  date: string;
  local: "all" | SessionLocation;
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
