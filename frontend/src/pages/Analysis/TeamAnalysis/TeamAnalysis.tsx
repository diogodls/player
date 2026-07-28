import styles from "./TeamAnalysis.module.scss";
import VideoAnalysis from "../../../components/elements/VideoAnalysis/VideoAnalysis.tsx";
import ActionLog from "../../../components/elements/ActionLog/ActionLog.tsx";
import {useApi} from "../../../hooks/useApi.ts";
import type {TeamCatalog} from "../index";
import type {Session} from "../../Sessions";
import TeamActions from "../../../components/TeamAnalysis/TeamActions/TeamActions.tsx";
import SessionAnalysisHeader from "../../../components/elements/SessionAnalysisHeader/SessionAnalysisHeader.tsx";
import { useSessionExitGuard } from "../../../hooks/useSessionExitGuard.ts";
import AnalysisExitModal from "../../../components/elements/AnalysisExitModal/AnalysisExitModal.tsx";
import {useParams} from "react-router";

const TeamAnalysis = () => {
  const {id: sessionId} = useParams<{id: string}>();
  const {data: session, isLoading: isSessionLoading, isError: sessionError} =
    useApi<Session>(sessionId ? `/sessions/${sessionId}` : null);
  const {data: catalog, isLoading: isCatalogLoading, isError: catalogError} =
    useApi<TeamCatalog>("/catalog/actions/team");

  const exitGuard = useSessionExitGuard({
    logType: "team",
    sessionId: sessionId ?? '0',
  });

  if (isSessionLoading || isCatalogLoading) {
    return <div className={styles.feedback}>Carregando análise de equipe...</div>;
  }

  if (!sessionId || sessionError || catalogError || !session || !catalog) {
    return <div className={styles.feedback}>Não foi possível carregar a análise de equipe.</div>;
  }

  return (
    <div className={styles.container}>
      <SessionAnalysisHeader session={session} onBack={exitGuard.requestExit} />

      <div className={styles.content}>
        <div className={styles.leftContent}>
          <TeamActions groups={catalog.groups} session={session}/>
        </div>
        <div className={styles.videoAnalysis}>
          <VideoAnalysis/>
        </div>
        <div className={styles.actionLog}>
          <ActionLog logType={'team'} session={session}/>
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
