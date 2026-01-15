import styles from "./CoachDashboard.module.scss";
import {useApi} from "../../hooks/useApi.ts";
import type {CoachDashboardData} from "./index";
import AverageTeamCard from "../../components/AverageTeamCard/AverageTeamCard.tsx";
import HeaderDashboard from  "../../components/HeaderDashboard/HeaderDashboard.tsx";

const CoachDashboard = () => {
  const { data } = useApi<CoachDashboardData>("coach-dashboard");

  return (
    <div className={styles.container}>
      <AverageTeamCard cards={data?.averageTeamCards ?? []}/>
      <HeaderDashboard/>
    </div>
  );
}
export default CoachDashboard;