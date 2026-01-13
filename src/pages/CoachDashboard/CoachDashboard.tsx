import styles from "./CoachDashboard.module.scss";
import {useApi} from "../../hooks/useApi.ts";
import type {CoachDashboardData} from "./index";
import AverageTeamCard from "../../components/AverageTeamCard/AverageTeamCard.tsx";

const CoachDashboard = () => {
  const { data } = useApi<CoachDashboardData>("coach-dashboard");

  return (
    <div className={styles.container}>
      <AverageTeamCard cards={data?.averageTeamCards ?? []}/>
    </div>
  );
}
export default CoachDashboard;