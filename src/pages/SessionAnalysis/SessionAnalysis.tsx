import styles from "./SessionAnalysis.module.scss";
import { useState } from "react";
import { useParams } from "react-router";
import { useApi } from "../../hooks/useApi";
import type {
  SessionAnalysisAthlete,
  SessionAnalysisByIdData,
  SessionAnalysisData,
  SessionAnalysisSummary as SessionAnalysisSummaryData,
} from "./index";
import SessionAnalysisHeader from "../../components/SessionAnalysis/SessionAnalysisHeader/SessionAnalysisHeader";
import SessionAnalysisDetails from "../../components/SessionAnalysis/SessionAnalysisDetails/SessionAnalysisDetails";
import SessionAnalysisSummary from "../../components/SessionAnalysis/SessionAnalysisSummary/SessionAnalysisSummary.tsx";
import SessionAnalysisActionCard from "../../components/SessionAnalysis/SessionAnalysisActions/SessionAnalysisActionCard/SessionAnalysisActionCard.tsx";
import type { Player } from "../CoachDashboard";
import { useSessions } from "../../contexts/SessionsContext/SessionsContext";

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function safePercent(value: number, total: number) {
  if (total <= 0) return 0;
  return Math.round((value / total) * 100);
}

type AnalysisTab = "individual" | "team";

const SessionAnalysis = () => {
  const [activeTab, setActiveTab] = useState<AnalysisTab>("individual");
  const { id } = useParams<{ id: string }>();
  const { data: analysisData } = useApi<SessionAnalysisData>("session-analysis");
  const { data: players } = useApi<Player[]>("players");
  const { sessions } = useSessions();
  const analysisById: SessionAnalysisByIdData | undefined = id ? analysisData?.[id] : undefined;

  const session = sessions.find((item) => item.id === id);

  const athletes: SessionAnalysisAthlete[] =
    analysisById?.players.map((athlete, index) => {
      const player = players?.find((item) => String(item.id) === String(athlete.playerId));
      const totalActions = athlete.actions.length;

      return {
        id: String(athlete.playerId),
        initials: getInitials(player?.name ?? "N D"),
        title: player?.name ?? `Atleta ${athlete.playerId}`,
        variant: index % 2 === 0 ? "yellow" : "red",
        metrics: {
          overall: player?.overall ?? 0,
          overallLabel: "OVR",
          offensive: athlete.offensive,
          defensive: athlete.defensive,
          aproveitamento: safePercent(athlete.positive, totalActions),
        },
        actions: athlete.actions.map((action, actionIndex) => ({
          id: `${athlete.playerId}-${action.key}-${action.time}-${actionIndex}`,
          title: action.label,
          subtitle: action.key,
          time: action.time,
          type: action.type === "positive" ? "good" : "bad",
        })),
      };
    }) ?? [];

  const summary: SessionAnalysisSummaryData = analysisById?.players.reduce(
    (acc, athlete) => ({
      positives: acc.positives + athlete.positive,
      negatives: acc.negatives + athlete.negative,
    }),
    { positives: 0, negatives: 0 }
  ) ?? { positives: 0, negatives: 0 };

  const teamTotalActions = analysisById?.team?.actions.length ?? 0;
  const teamCard: SessionAnalysisAthlete | null = analysisById?.team
    ? {
      id: "team",
      initials: "EQ",
      title: "Equipe",
      variant: "yellow",
      defaultOpen: false,
      metrics: {
        overall: teamTotalActions,
        overallLabel: "TOTAL",
        offensive: analysisById.team.offensive,
        defensive: analysisById.team.defensive,
        aproveitamento: safePercent(analysisById.team.positive, teamTotalActions),
      },
      actions: analysisById.team.actions.map((action, actionIndex) => ({
        id: `team-${action.key}-${action.time}-${actionIndex}`,
        title: action.label,
        subtitle: action.key,
        time: action.time,
        type: action.type === "positive" ? "good" : "bad",
      })),
    }
    : null;

  return (
    <div className={styles.container}>
      <SessionAnalysisHeader active={activeTab} onChange={setActiveTab} />
      <SessionAnalysisDetails session={session} />
      <SessionAnalysisSummary summary={summary} />

      {activeTab === "individual" && (
        <>
          <h3 className={styles.sectionTitle}>Acoes por Atleta</h3>
          <div className={styles.cardsList}>
            {athletes.map((athlete) => (
              <SessionAnalysisActionCard key={athlete.id} {...athlete} />
            ))}
          </div>
        </>
      )}

      {activeTab === "team" && (
        <>
          <h3 className={styles.sectionTitle}>Acoes da Equipe</h3>
          <div className={styles.cardsList}>
            {teamCard && <SessionAnalysisActionCard {...teamCard} />}
          </div>
        </>
      )}
    </div>
  );
};

export default SessionAnalysis;
