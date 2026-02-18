import styles from "../CoachDashboard/CoachDashboard.module.scss";
import VideoAnalysis from "../../components/VideoAnalysis/VideoAnalysis.tsx";
import ActionLog from "../../components/ActionLog/ActionLog.tsx";
import HeaderAnalysis from "../../components/HeaderAnalysis/HeaderAnalysis.tsx";

const IndividualAnalysis = () => {
  return (
    <div className={styles.container}>
      <HeaderAnalysis
        onSave={() => console.log("Salvar")}
        onClear={() => console.log("Limpar")}
      />
      <VideoAnalysis/>
      <ActionLog/>
    </div>
  );
};

export default IndividualAnalysis;
