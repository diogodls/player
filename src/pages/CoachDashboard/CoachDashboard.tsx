import styles from "./CoachDashboard.module.scss";
import {useApi} from "../../hooks/useApi.ts";
import type {CoachDashboardData} from "./index";
import AverageTeamCard from "../../components/CoachDashboard/AverageTeamCard/AverageTeamCard.tsx";
import HeaderDashboard from "../../components/CoachDashboard/HeaderDashboard/HeaderDashboard.tsx";
import {useState} from "react";
import PlayerComparison from "../../components/CoachDashboard/PlayerComparison/PlayerComparison.tsx";
import PlayersSection from "../../components/CoachDashboard/PlayersSection/PlayersSection.tsx";
import Filters from "../../components/CoachDashboard/Filters/Filters.tsx";
import {PLAYERS_POSITIONS} from "../../constants/players.ts";

type ViewMode = 'team' | 'individual' | 'compare';
type PositionFilter = "all" | (typeof PLAYERS_POSITIONS)[number];

const CoachDashboard = () => {
  const { data } = useApi<CoachDashboardData>("coach-dashboard");
  const [viewMode, setViewMode] = useState<ViewMode>('team');
  const [positionFilter, setPositionFilter] = useState<PositionFilter>("all");

  const filteredPlayers = (data?.players ?? []).filter((player) => {
    if (positionFilter === "all") return true;
    return player.position === positionFilter;
  });

  return (
    <div className={styles.container}>
      <AverageTeamCard cards={data?.averageTeamCards ?? []}/>
      <HeaderDashboard
        viewMode={viewMode}
        onChangeView={setViewMode}
      />
      {/*{viewMode === 'team' && <TeamAnalysis />}*/}
        {viewMode === 'individual' &&
          <>
              <Filters
                position={positionFilter}
                onChangePosition={setPositionFilter}
              />
              <PlayersSection players={filteredPlayers} />
          </>
        }
      {viewMode === 'compare' && <PlayerComparison players={data?.players} metrics={data?.metrics} />}
    </div>
  );
};
export default CoachDashboard;
