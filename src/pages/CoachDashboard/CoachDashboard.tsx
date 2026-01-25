import styles from "./CoachDashboard.module.scss";
import {useApi} from "../../hooks/useApi.ts";
import type {CoachDashboardData} from "./index";
import AverageTeamCard from "../../components/AverageTeamCard/AverageTeamCard.tsx";
import PlayerCard from "../../components/PlayerCard/PlayerCard.tsx";  

const CoachDashboard = () => {
  const { data } = useApi<CoachDashboardData>("coach-dashboard");

  return (
    <div className={styles.container}>
      <AverageTeamCard cards={data?.averageTeamCards ?? []}/>

    <div className={styles.playersSection}>
        {data?.players?.map((player) => (
          <PlayerCard
            key={player.id}
            player={player}
          />
      ))}
    </div>
    </div>
  );
};
export default CoachDashboard;