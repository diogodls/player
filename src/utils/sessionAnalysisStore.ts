import type { SessionAnalysisByIdData, SessionAnalysisData } from "../pages/SessionAnalysis";

const SESSION_ANALYSIS_OVERRIDES_STORAGE_KEY = "ufsm_session_analysis_overrides";

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function readSessionAnalysisOverrides(): SessionAnalysisData {
  if (typeof window === "undefined") return {};

  const raw = localStorage.getItem(SESSION_ANALYSIS_OVERRIDES_STORAGE_KEY);
  if (!raw) return {};

  try {
    const parsed = JSON.parse(raw);
    if (!isObjectRecord(parsed)) return {};
    return parsed as SessionAnalysisData;
  } catch {
    return {};
  }
}

export function saveSessionAnalysisOverride(sessionId: string, data: SessionAnalysisByIdData): SessionAnalysisData {
  if (typeof window === "undefined") return {};

  const current = readSessionAnalysisOverrides();
  const next = {
    ...current,
    [sessionId]: data,
  };

  localStorage.setItem(SESSION_ANALYSIS_OVERRIDES_STORAGE_KEY, JSON.stringify(next));
  return next;
}

export function mergeSessionAnalysisData(baseData?: SessionAnalysisData): SessionAnalysisData {
  return {
    ...(baseData ?? {}),
    ...readSessionAnalysisOverrides(),
  };
}

