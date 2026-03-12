import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useApi } from "../../hooks/useApi";
import type { Session, SessionData, SessionMeta } from "../../pages/SessionView";

const EXTRA_SESSIONS_STORAGE_KEY = "ufsm_extra_sessions";

type SessionsContextValue = {
  sessions: Session[];
  addSession: (meta: SessionMeta) => Session;
};

const SessionsContext = createContext<SessionsContextValue>({} as SessionsContextValue);

function normalizeDate(value: string) {
  if (!value.includes("-")) return value;

  const [year, month, day] = value.split("-");
  if (!year || !month || !day) return value;
  return `${day}/${month}/${year}`;
}

function createSessionId(baseSessions: Session[], extraSessions: Session[]) {
  const takenIds = new Set([...baseSessions, ...extraSessions].map((session) => session.id));
  let nextId = String(Date.now());

  while (takenIds.has(nextId)) {
    nextId = String(Number(nextId) + 1);
  }

  return nextId;
}

const SessionsProvider = ({ children }: { children: ReactNode }) => {
  const { data } = useApi<SessionData>("sessions");
  const [extraSessions, setExtraSessions] = useState<Session[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(EXTRA_SESSIONS_STORAGE_KEY);
      if (!raw) return;

      const parsed = JSON.parse(raw) as Session[];
      if (Array.isArray(parsed)) {
        setExtraSessions(parsed);
      }
    } catch {
      localStorage.removeItem(EXTRA_SESSIONS_STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(EXTRA_SESSIONS_STORAGE_KEY, JSON.stringify(extraSessions));
  }, [extraSessions]);

  const sessions = useMemo(() => {
    const baseSessions = data?.sessions ?? [];
    return [...baseSessions, ...extraSessions];
  }, [data?.sessions, extraSessions]);

  const addSession = useCallback((meta: SessionMeta) => {
    const baseSessions = data?.sessions ?? [];

    const created: Session = {
      id: createSessionId(baseSessions, extraSessions),
      type: meta.type,
      date: normalizeDate(meta.date),
      local: meta.local.trim(),
      ...(meta.type === "Treino"
        ? { description: meta.description?.trim() }
        : { opponent: meta.opponent?.trim() }),
    };

    setExtraSessions((previous) => [...previous, created]);
    return created;
  }, [data?.sessions, extraSessions]);

  const value = useMemo(
    () => ({
      sessions,
      addSession,
    }),
    [sessions, addSession]
  );

  return <SessionsContext.Provider value={value}>{children}</SessionsContext.Provider>;
};

const useSessions = () => useContext(SessionsContext);

export { SessionsProvider, useSessions };
