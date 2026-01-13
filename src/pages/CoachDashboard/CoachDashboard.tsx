import styles from "./CoachDashboard.module.scss";
import {useApi} from "../../hooks/useApi.ts";
import type {CoachDashboard} from "./index";
import AverageTeamCard from "../../components/AverageTeamCard/AverageTeamCard.tsx";

const CoachDashboard = () => {
  const { data } = useApi<CoachDashboard>("coach-dashboard");

  return (
    <div className={styles.container}>
      <AverageTeamCard cards={data?.averageTeamCards ?? []}/>
    </div>
  );
}
export default CoachDashboard;