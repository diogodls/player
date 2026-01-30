import styles from "../CoachDashboard/CoachDashboard.module.scss";
import VideoAnalysis from "../../components/VideoAnalysis/VideoAnalysis.tsx";

const IndividualAnalysis = () =>{
  return(
    <div className={styles.container}>
      <VideoAnalysis/>
    </div>
  );
};

export default IndividualAnalysis;
