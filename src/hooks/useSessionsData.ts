import { useCallback, useEffect, useMemo, useState } from "react";
import { useApi } from "./useApi";
import type { Session, SessionData, SessionMeta } from "../pages/SessionView";

const EXTRA_SESSIONS_STORAGE_KEY = "ufsm_extra_sessions";
const SESSION_OVERRIDES_STORAGE_KEY = "ufsm_session_overrides";
const DELETED_SESSIONS_STORAGE_KEY = "ufsm_deleted_sessions";

type SessionOverrides = Record<string, Session>;

function normalizeDate(value: string) {
  if (!value.includes("-")) return value;

  const [year, month, day] = value.split("-");
  if (!year || !month || !day) return value;
  return `${day}/${month}/${year}`;
}

function createSessionId(existingSessions: Session[]) {
  const takenIds = new Set(existingSessions.map((session) => session.id));
  let nextId = String(Date.now());

  while (takenIds.has(nextId)) {
    nextId = String(Number(nextId) + 1);
  }

  return nextId;
}

function toSession(meta: SessionMeta, id: string): Session {
  return {
    id,
    type: meta.type,
    date: normalizeDate(meta.date),
    local: meta.local.trim(),
    ...(meta.type === "Treino"
      ? { description: meta.description?.trim() }
      : { opponent: meta.opponent?.trim() }),
  };
}

export function useSessionsData() {
  const { data, isLoading } = useApi<SessionData>("sessions");
  const [extraSessions, setExtraSessions] = useState<Session[]>([]);
  const [sessionOverrides, setSessionOverrides] = useState<SessionOverrides>({});
  const [deletedSessionIds, setDeletedSessionIds] = useState<string[]>([]);
  const [hasHydratedStorage, setHasHydratedStorage] = useState(false);

  useEffect(() => {
    try {
      const rawExtra = localStorage.getItem(EXTRA_SESSIONS_STORAGE_KEY);
      if (rawExtra) {
        const parsed = JSON.parse(rawExtra) as Session[];
        if (Array.isArray(parsed)) {
          setExtraSessions(parsed);
        }
      }

      const rawOverrides = localStorage.getItem(SESSION_OVERRIDES_STORAGE_KEY);
      if (rawOverrides) {
        const parsed = JSON.parse(rawOverrides) as SessionOverrides;
        if (parsed && typeof parsed === "object") {
          setSessionOverrides(parsed);
        }
      }

      const rawDeleted = localStorage.getItem(DELETED_SESSIONS_STORAGE_KEY);
      if (rawDeleted) {
        const parsed = JSON.parse(rawDeleted) as string[];
        if (Array.isArray(parsed)) {
          setDeletedSessionIds(parsed);
        }
      }
    } catch {
      localStorage.removeItem(EXTRA_SESSIONS_STORAGE_KEY);
      localStorage.removeItem(SESSION_OVERRIDES_STORAGE_KEY);
      localStorage.removeItem(DELETED_SESSIONS_STORAGE_KEY);
    } finally {
      setHasHydratedStorage(true);
    }
  }, []);

  useEffect(() => {
    if (!hasHydratedStorage) return;
    localStorage.setItem(EXTRA_SESSIONS_STORAGE_KEY, JSON.stringify(extraSessions));
  }, [extraSessions, hasHydratedStorage]);

  useEffect(() => {
    if (!hasHydratedStorage) return;
    localStorage.setItem(SESSION_OVERRIDES_STORAGE_KEY, JSON.stringify(sessionOverrides));
  }, [sessionOverrides, hasHydratedStorage]);

  useEffect(() => {
    if (!hasHydratedStorage) return;
    localStorage.setItem(DELETED_SESSIONS_STORAGE_KEY, JSON.stringify(deletedSessionIds));
  }, [deletedSessionIds, hasHydratedStorage]);

  const sessions = useMemo(() => {
    const baseSessions = data?.sessions ?? [];

    const mergedBase = baseSessions
      .map((session) => sessionOverrides[session.id] ?? session)
      .filter((session) => !deletedSessionIds.includes(session.id));

    const mergedExtra = extraSessions
      .map((session) => sessionOverrides[session.id] ?? session)
      .filter((session) => !deletedSessionIds.includes(session.id));

    return [...mergedBase, ...mergedExtra];
  }, [data?.sessions, extraSessions, sessionOverrides, deletedSessionIds]);

  const addSession = useCallback((meta: SessionMeta) => {
    const created = toSession(meta, createSessionId(sessions));

    setExtraSessions((previous) => [...previous, created]);
    setDeletedSessionIds((previous) => previous.filter((id) => id !== created.id));

    return created;
  }, [sessions]);

  const updateSession = useCallback((sessionId: string, meta: SessionMeta) => {
    const existing = sessions.find((session) => session.id === sessionId);
    if (!existing) return null;

    const updated = toSession(meta, sessionId);

    setSessionOverrides((previous) => ({
      ...previous,
      [sessionId]: updated,
    }));

    return updated;
  }, [sessions]);

  const deleteSession = useCallback((sessionId: string) => {
    setExtraSessions((previous) => previous.filter((session) => session.id !== sessionId));

    setSessionOverrides((previous) => {
      const next = { ...previous };
      delete next[sessionId];
      return next;
    });

    setDeletedSessionIds((previous) => {
      if (previous.includes(sessionId)) return previous;
      return [...previous, sessionId];
    });
  }, []);

  return {
    sessions,
    addSession,
    updateSession,
    deleteSession,
    isLoading: isLoading || !hasHydratedStorage,
  };
}
