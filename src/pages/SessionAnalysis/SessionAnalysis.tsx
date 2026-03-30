import styles from "./SessionAnalysis.module.scss";
import { Navigate, useParams } from "react-router";
import { useMemo } from "react";
import { useApi } from "../../hooks/useApi";
import type { Session as SessionAnalysisSession, SessionItemAction } from "./index";
import type { Session, SessionData } from "../SessionView";
import type { IndividualAnalysisData } from "../IndividualAnalysis";
import SessionAnalysisHeader from "../../components/SessionAnalysis/SessionAnalysisHeader/SessionAnalysisHeader";
import SessionAnalysisDetails from "../../components/SessionAnalysis/SessionAnalysisDetails/SessionAnalysisDetails";
import SessionAnalysisSummary from "../../components/SessionAnalysis/SessionAnalysisSummary/SessionAnalysisSummary";
import SessionAnalysisActionCard from "../../components/SessionAnalysis/SessionAnalysisActions/SessionAnalysisActionCard/SessionAnalysisActionCard";

type RawSessionAction = {
  time: string;
  key: string;
  label: string;
  type: "positive" | "negative";
};

type RawSessionPlayer = {
  playerId: number | string;
  offensive: number;
  defensive: number;
  positive: number;
  negative: number;
  actions: RawSessionAction[];
};

type RawSessionTeam = {
  offensive: number;
  defensive: number;
  positive: number;
  negative: number;
  actions: RawSessionAction[];
};

type RawSessionAnalysis = {
  players: RawSessionPlayer[];
  team: RawSessionTeam;
};

type RawSessionAnalysisData = Record<string, RawSessionAnalysis>;

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function inferCategory(action: RawSessionAction) {
  const value = normalizeText(`${action.key} ${action.label}`);
  if (
    value.includes("defens") ||
    value.includes("gol sofrido") ||
    value.includes("roubada") ||
    value.includes("desarme") ||
    value.includes("intercept") ||
    value.includes("antecip")
  ) {
    return "Acoes defensivas";
  }

  return "Acoes ofensivas";
}

function toContractAction(
  action: RawSessionAction,
  actionMetadata: Map<string, IndividualAnalysisData["actions"][number]>
): SessionItemAction {
  const metadata = actionMetadata.get(action.key);

  return {
    key: action.key,
    label: action.label,
    time: action.time,
    category: metadata?.category ?? inferCategory(action),
    goodAction: metadata?.goodAction ?? action.type === "positive",
  };
}

function buildAnalysisSession(
  baseSession: Session,
  rawSession: RawSessionAnalysis,
  playerNames: Map<number, string>,
  actionMetadata: Map<string, IndividualAnalysisData["actions"][number]>
): SessionAnalysisSession {
  const players = rawSession.players.map((player) => ({
    name: playerNames.get(Number(player.playerId)) ?? `Jogador ${player.playerId}`,
    totalOffensiveActions: player.offensive,
    totalDefensiveActions: player.defensive,
    actions: player.actions.map((action) => toContractAction(action, actionMetadata)),
  }));

  return {
    id: Number(baseSession.id),
    type: baseSession.type,
    date: baseSession.date,
    local: baseSession.local,
    description: baseSession.description,
    opponent: baseSession.opponent,
    players,
    totalIndividualPositiveActions: rawSession.players.reduce((total, player) => total + player.positive, 0),
    totalIndividualNegativeActions: rawSession.players.reduce((total, player) => total + player.negative, 0),
    team: {
      name: "Equipe",
      totalOffensiveActions: rawSession.team.offensive,
      totalDefensiveActions: rawSession.team.defensive,
      actions: rawSession.team.actions.map((action) => toContractAction(action, actionMetadata)),
    },
    totalTeamPositiveActions: rawSession.team.positive,
    totalTeamNegativeActions: rawSession.team.negative,
  };
}

const SessionAnalysis = () => {
  const { id } = useParams<{ id: string }>();
  const { data: sessionsData, isLoading: isSessionsLoading } = useApi<SessionData>("sessions");
  const { data: rawAnalysisData } = useApi<RawSessionAnalysisData>("session-analysis");
  const { data: individualAnalysisData } = useApi<IndividualAnalysisData>("individual-analysis");

  const analysisSession = useMemo<SessionAnalysisSession | null>(() => {
    if (!id || !sessionsData?.sessions || !rawAnalysisData || !individualAnalysisData) return null;

    const baseSession = sessionsData.sessions.find((item) => item.id === id);
    const rawSession = rawAnalysisData[id];

    if (!baseSession || !rawSession) return null;

    const playerNames = new Map(individualAnalysisData.players.map((player) => [player.id, player.name]));
    const actionMetadata = new Map(individualAnalysisData.actions.map((action) => [action.key, action]));

    return buildAnalysisSession(baseSession, rawSession, playerNames, actionMetadata);
  }, [id, individualAnalysisData, rawAnalysisData, sessionsData?.sessions]);

  if (!id) {
    return <Navigate to="/session-screen" replace />;
  }

  if (isSessionsLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.contentWrap}>Carregando sessao...</div>
      </div>
    );
  }

  if (!analysisSession) {
    return <Navigate to="/session-screen" replace />;
  }

  const totalTeamActions = analysisSession.totalTeamPositiveActions + analysisSession.totalTeamNegativeActions;
  const positivePercentage =
    totalTeamActions === 0 ? 0 : Math.round((analysisSession.totalTeamPositiveActions / totalTeamActions) * 100);
  const negativePercentage = totalTeamActions === 0 ? 0 : 100 - positivePercentage;

  return (
    <div className={styles.container}>
      <div className={styles.contentWrap}>
        <SessionAnalysisHeader sessionId={String(analysisSession.id)} />
        <SessionAnalysisDetails session={analysisSession} />

        <SessionAnalysisSummary
          positives={analysisSession.totalTeamPositiveActions}
          negatives={analysisSession.totalTeamNegativeActions}
          positivePercentage={positivePercentage}
          negativePercentage={negativePercentage}
        />

        <h3 className={styles.sectionTitle}>Acoes da Equipe</h3>
        <div className={styles.cardsList}>
          <SessionAnalysisActionCard item={analysisSession.team} entityType="team" defaultOpen />
        </div>
      </div>
    </div>
  );
};

export default SessionAnalysis;
