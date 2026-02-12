import styles from "./IndividualAnalysis.module.scss";
import VideoAnalysis from "../../components/VideoAnalysis/VideoAnalysis.tsx";
import ActionLog from "../../components/ActionLog/ActionLog.tsx";
import PlayerSelector from "../../components/PlayerSelector/PlayerSelector.tsx";
import {useApi} from "../../hooks/useApi.ts";
import type {CoachDashboardData} from "../CoachDashboard";

const IndividualAnalysis = () => {
  const { data } = useApi<CoachDashboardData>("coach-dashboard"); //todo: trocar para nova rota quando o componente de analise individual for para a main

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.leftContent}>
          <PlayerSelector players={data?.players ?? []}/>
        </div>
        <div className={styles.rightContent}>
          <VideoAnalysis/>
          <ActionLog/>
        </div>
      </div>
    </div>
  );
};

export default IndividualAnalysis;
