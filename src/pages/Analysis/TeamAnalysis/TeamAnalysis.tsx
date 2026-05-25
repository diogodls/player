import styles from "./TeamAnalysis.module.scss";
import VideoAnalysis from "../../../components/elements/VideoAnalysis/VideoAnalysis.tsx";
import ActionLog from "../../../components/elements/ActionLog/ActionLog.tsx";
import {useApi} from "../../../hooks/useApi.ts";
import type {TeamAnalysisData} from "../index";
import TeamActions from "../../../components/TeamAnalysis/TeamActions/TeamActions.tsx";
import SessionAnalysisHeader from "../../../components/elements/SessionAnalysisHeader/SessionAnalysisHeader.tsx";
import { useSessionExitGuard } from "../../../hooks/useSessionExitGuard.ts";
import AnalysisExitModal from "../../../components/elements/AnalysisExitModal/AnalysisExitModal.tsx";

const TeamAnalysis = () => {
  const {data} = useApi<TeamAnalysisData>("team-analysis");

  const exitGuard = useSessionExitGuard({
    logType: "team",
    sessionId: data!.session.id,
  });

  if (!data) return;

  return (
    <div className={styles.container}>
      <SessionAnalysisHeader session={data.session} onBack={exitGuard.requestExit} />

      <div className={styles.content}>
        <div className={styles.leftContent}>
          <TeamActions actions={data.actions} session={data.session}/>
        </div>
        <div className={styles.videoAnalysis}>
          <VideoAnalysis/>
        </div>
        <div className={styles.actionLog}>
          <ActionLog logType={'team'} session={data.session}/>
        </div>
      </div>
      {exitGuard.isExitModalOpen &&
        <AnalysisExitModal
          onCancel={exitGuard.closeExitModal}
          onDiscard={exitGuard.handleExitWithoutSaving}
          onSave={exitGuard.handleSaveAndExit}
        />
      }
    </div>
  );
};

export default TeamAnalysis;
