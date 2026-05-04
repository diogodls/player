import styles from "./TeamAnalysis.module.scss";
import VideoAnalysis from "../../../components/elements/VideoAnalysis/VideoAnalysis.tsx";
import ActionLog from "../../../components/elements/ActionLog/ActionLog.tsx";
import {useApi} from "../../../hooks/useApi.ts";
import type {TeamAnalysisData} from "../index";
import TeamActions from "../../../components/TeamAnalysis/TeamActions/TeamActions.tsx";
import SessionAnalysisHeader from "../../../components/elements/SessionAnalysisHeader/SessionAnalysisHeader.tsx";

const TeamAnalysis = () => {
  const {data} = useApi<TeamAnalysisData>("team-analysis");

  if (!data) return;

  return (
    <div className={styles.container}>
      <SessionAnalysisHeader session={data.session} />

      <div className={styles.content}>
        <div className={styles.leftContent}>
          <TeamActions actions={data?.actions ?? []} />
        </div>
        <div className={styles.videoAnalysis}>
          <VideoAnalysis/>
        </div>
        <div className={styles.actionLog}>
          <ActionLog logType={'team'} session={data?.session}/>
        </div>
      </div>
    </div>
  );
};

export default TeamAnalysis;