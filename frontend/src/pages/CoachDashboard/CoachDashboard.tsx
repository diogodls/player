import styles from "./CoachDashboard.module.scss";
import {useApi} from "../../hooks/useApi.ts";
import type {CoachDashboardData} from "./index";
import AverageTeamCard from "../../components/CoachDashboard/AverageTeamCard/AverageTeamCard.tsx";
import HeaderDashboard from "../../components/CoachDashboard/HeaderDashboard/HeaderDashboard.tsx";
import {useMemo, useState} from "react";
import PlayerComparison from "../../components/CoachDashboard/PlayerComparison/PlayerComparison.tsx";
import PlayersSection from "../../components/CoachDashboard/PlayersSection/PlayersSection.tsx";
import {PLAYERS_POSITIONS} from "../../constants/players.ts";
import TeamData from "../../components/CoachDashboard/TeamData/TeamData.tsx";
import PlayersFilter from "../../components/CoachDashboard/PlayersFilter/PlayersFilter.tsx";
import {mockApi} from "../../utils/api.ts";

type ViewMode = 'team' | 'individual' | 'compare';
type PositionFilter = "all" | (typeof PLAYERS_POSITIONS)[number];

const CoachDashboard = () => {
  const { data } = useApi<CoachDashboardData>("coach-dashboard", { client: mockApi });
  const [viewMode, setViewMode] = useState<ViewMode>('team');
  const [positionFilter, setPositionFilter] = useState<PositionFilter>("all");
  const [nameFilter, setNameFilter] = useState("");

  const filteredPlayers = useMemo(() => {
    const normalizedName = nameFilter.trim().toLocaleLowerCase();

    return data?.players.filter((athlete) => {
      const matchesName = athlete.name.toLocaleLowerCase().includes(normalizedName);
      const matchesPosition =
        positionFilter === "all" || athlete.position === positionFilter;

      return matchesName && matchesPosition;
    });
  }, [data?.players, nameFilter, positionFilter]);

  return (
    <div className={styles.container}>
      <AverageTeamCard cards={data?.averageTeamCards ?? []}/>
      <HeaderDashboard
        viewMode={viewMode}
        onChangeView={setViewMode}
      />
      {viewMode === 'team' && <TeamData teamRelevantIndexes={data?.teamIndexes ?? []} />}
      {viewMode === 'individual' &&
        <>
            <PlayersFilter
              position={positionFilter}
              onChangePosition={setPositionFilter}
              onNameChange={setNameFilter}
              nameFilter={nameFilter}
            />
            <PlayersSection players={filteredPlayers ?? []} />
        </>
      }
      {viewMode === 'compare' && <PlayerComparison players={data?.players} metrics={data?.metrics} />}
    </div>
  );
};
export default CoachDashboard;
