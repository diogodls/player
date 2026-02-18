import styles from "../CoachDashboard/CoachDashboard.module.scss";
import VideoAnalysis from "../../components/VideoAnalysis/VideoAnalysis.tsx";
import ActionLog from "../../components/ActionLog/ActionLog.tsx";

const IndividualAnalysis = () => {
  return (
    <div className={styles.container}>
      <VideoAnalysis/>
      <ActionLog/>
    </div>
  );
};

export default IndividualAnalysis;
