import { useMemo, useState } from "react";
import styles from "./CoachDashboard.module.scss";
import { useApi } from "../../hooks/useApi.ts";
import type { CoachDashboardResponse, Player } from "./index";
import AverageTeamCard from "../../components/CoachDashboard/AverageTeamCard/AverageTeamCard.tsx";
import HeaderDashboard from "../../components/CoachDashboard/HeaderDashboard/HeaderDashboard.tsx";
import PlayerComparison from "../../components/CoachDashboard/PlayerComparison/PlayerComparison.tsx";
import PlayersSection from "../../components/CoachDashboard/PlayersSection/PlayersSection.tsx";
import { PLAYERS_POSITIONS } from "../../constants/players.ts";
import TeamData from "../../components/CoachDashboard/TeamData/TeamData.tsx";
import PlayersFilter from "../../components/CoachDashboard/PlayersFilter/PlayersFilter.tsx";

type ViewMode = "team" | "individual" | "compare";
type PositionFilter = "all" | (typeof PLAYERS_POSITIONS)[number];

const CoachDashboard = () => {
  const { data, error, isLoading } = useApi<CoachDashboardResponse>(
    "/coach-dashboard",
    { keepPreviousData: false },
  );
  const [viewMode, setViewMode] = useState<ViewMode>("team");
  const [positionFilter, setPositionFilter] = useState<PositionFilter>("all");
  const [nameFilter, setNameFilter] = useState("");
  const players = useMemo(
    () => (data?.players ?? []).filter(isCompletePlayer),
    [data?.players],
  );
  const filteredPlayers = useMemo(() => {
    const normalizedName = nameFilter.trim().toLocaleLowerCase();
    return players.filter((athlete) => {
      const matchesName = athlete.name
        .toLocaleLowerCase()
        .includes(normalizedName);
      const matchesPosition =
        positionFilter === "all" || athlete.position === positionFilter;
      return matchesName && matchesPosition;
    });
  }, [players, nameFilter, positionFilter]);

  if (isLoading)
    return (
      <div className={styles.container}>
        <div className={styles.feedback}>Carregando dashboard...</div>
      </div>
    );
  if (error)
    return (
      <div className={styles.container}>
        <div className={styles.feedback}>
          Não foi possível carregar a dashboard.
        </div>
      </div>
    );

  return (
    <div className={styles.container}>
      <AverageTeamCard cards={data?.averageTeamCards ?? []} />
      <HeaderDashboard viewMode={viewMode} onChangeView={setViewMode} />
      {viewMode === "team" && (
        <TeamData teamRelevantIndexes={data?.teamIndexes ?? []} />
      )}
      {viewMode === "individual" && (
        <>
          <PlayersFilter
            position={positionFilter}
            onChangePosition={setPositionFilter}
            onNameChange={setNameFilter}
            nameFilter={nameFilter}
          />
          <PlayersSection players={filteredPlayers} />
        </>
      )}
      {viewMode === "compare" && (
        <PlayerComparison players={players} metrics={data?.metrics ?? []} />
      )}
    </div>
  );
};
export default CoachDashboard;

function isCompletePlayer(player: Partial<Player>): player is Player {
  return (
    typeof player.id === "string" &&
    typeof player.name === "string" &&
    typeof player.position === "string" &&
    typeof player.overall === "number" &&
    typeof player.minutes === "number" &&
    typeof player.defensiveActions === "number" &&
    typeof player.offensiveActions === "number" &&
    typeof player.goalsTaken === "number" &&
    typeof player.goals === "number" &&
    Boolean(player.indexes)
  );
}
