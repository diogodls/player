import styles from "./SessionAnalysis.module.scss";
import { useParams } from "react-router";
import { useApi } from "../../hooks/useApi";
import type {
  SessionAnalysisAthlete,
  SessionAnalysisByIdData,
  SessionAnalysisSummary as SessionAnalysisSummaryData,
} from "./index";
import SessionAnalysisHeader from "../../components/SessionAnalysis/SessionAnalysisHeader/SessionAnalysisHeader";
import SessionAnalysisDetails from "../../components/SessionAnalysis/SessionAnalysisDetails/SessionAnalysisDetails";
import SessionAnalysisSummary from "../../components/SessionAnalysis/SessionAnalysisSummary/SessionAnalysisSummary.tsx";
import SessionAnalysisActionCard from "../../components/SessionAnalysis/SessionAnalysisActions/SessionAnalysisActionCard/SessionAnalysisActionCard.tsx";
import type { SessionData } from "../SessionView";
import type { Player } from "../CoachDashboard";

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

const SessionAnalysis = () => {
  const { id } = useParams<{ id: string }>();
  const { data: analysisById } = useApi<SessionAnalysisByIdData>(
    id ? `session-analysis/${id}` : null
  );
  const { data: sessionsData } = useApi<SessionData>("sessions");
  const { data: players } = useApi<Player[]>("players");

  const session = sessionsData?.sessions.find((item) => item.id === id);

  const athletes: SessionAnalysisAthlete[] =
    analysisById?.players.map((athlete, index) => {
      const player = players?.find((item) => item.id === athlete.playerId);
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

  return (
    <div className={styles.container}>
      <SessionAnalysisHeader />
      <SessionAnalysisDetails session={session} />
      <SessionAnalysisSummary summary={summary} />
      <h3 className={styles.sectionTitle}>Acoes por Atleta</h3>
      <div className={styles.cardsList}>
        {athletes.map((athlete) => (
          <SessionAnalysisActionCard key={athlete.id} {...athlete} />
        ))}
      </div>
    </div>
  );
};

export default SessionAnalysis;
