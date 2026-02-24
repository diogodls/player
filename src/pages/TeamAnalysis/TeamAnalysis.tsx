import VideoAnalysis from "../../components/elements/VideoAnalysis/VideoAnalysis.tsx";
import ActionLog from "../../components/elements/ActionLog/ActionLog.tsx";
import styles from "./TeamAnalysis.module.scss";
import {useApi} from "../../hooks/useApi.ts";
import type {TeamAnalysisData} from "./index";
import TeamActions from "../../components/TeamAnalysis/TeamActions/TeamActions.tsx";

const TeamAnalysis = () => {
  const {data} = useApi<TeamAnalysisData>("team-analysis");

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.leftContent}>
          <TeamActions actions={data?.actions ?? []} />
        </div>
        <div className={styles.videoAnalysis}>
          <VideoAnalysis/>
        </div>
        <div className={styles.actionLog}>
          <ActionLog/>
        </div>
      </div>
    </div>
  );
};

export default TeamAnalysis;