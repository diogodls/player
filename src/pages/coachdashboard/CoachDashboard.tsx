import AverageTeamCard from "../../components/AverageTeamCard/AverageTeamCard.tsx";
import styles from "./CoachDashboard.module.scss";

const CoachDashboard = () => {
  return (
    <div className={styles.container}>
      <AverageTeamCard/>
    </div>
  );
}
export default CoachDashboard;


