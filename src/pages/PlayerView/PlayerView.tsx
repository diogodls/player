import {useApi} from "../../hooks/useApi.ts";
import IndividualPlayer from "../../components/PlayerView/IndividualPlayer.tsx";
import type {PlayerViewData} from "./index";
import styles from './PlayerView.module.scss';
import {useParams} from "react-router";
import type {CoachDashboardData} from "../CoachDashboard";

const PlayerView = () => {
  const { id } = useParams<{ id: string }>();
  const { data: dashboardData } = useApi<CoachDashboardData>("coach-dashboard");
  const { data: playerViewData } = useApi<PlayerViewData>("player-view");

  if (!dashboardData || !playerViewData) return;

  const playerId = Number(id);
  const player = Number.isFinite(playerId)
    ? dashboardData.players.find((currentPlayer) => currentPlayer.id === playerId)
    : undefined;

  if (!player) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyState}>
          Atleta nao encontrado.
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <IndividualPlayer
        player={player}
        team={playerViewData.team}
        metrics={dashboardData.metrics}
      />
    </div>
  );
};

export default PlayerView;
