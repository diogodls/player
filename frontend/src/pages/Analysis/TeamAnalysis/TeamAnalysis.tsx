import styles from "./TeamAnalysis.module.scss";
import VideoAnalysis from "../../../components/elements/VideoAnalysis/VideoAnalysis.tsx";
import ActionLog from "../../../components/elements/ActionLog/ActionLog.tsx";
import {useApi} from "../../../hooks/useApi.ts";
import type {TeamAnalysisData, TeamCatalog} from "../index";
import TeamActions from "../../../components/TeamAnalysis/TeamActions/TeamActions.tsx";
import SessionAnalysisHeader from "../../../components/elements/SessionAnalysisHeader/SessionAnalysisHeader.tsx";
import { useSessionExitGuard } from "../../../hooks/useSessionExitGuard.ts";
import AnalysisExitModal from "../../../components/elements/AnalysisExitModal/AnalysisExitModal.tsx";
import {mockApi} from "../../../utils/api.ts";

const TeamAnalysis = () => {
  const {data, isLoading: isAnalysisLoading, isError: analysisError} =
    useApi<TeamAnalysisData>("team-analysis", { client: mockApi });
  const {data: catalog, isLoading: isCatalogLoading, isError: catalogError} =
    useApi<TeamCatalog>("catalog/actions/team");

  const exitGuard = useSessionExitGuard({
    logType: "team",
    sessionId: data?.session ? data.session.id : '0',
  });

  if (isAnalysisLoading || isCatalogLoading) {
    return <div className={styles.feedback}>Carregando análise de equipe...</div>;
  }

  if (analysisError || catalogError || !data || !catalog) {
    return <div className={styles.feedback}>Não foi possível carregar a análise de equipe.</div>;
  }

  return (
    <div className={styles.container}>
      <SessionAnalysisHeader session={data.session} onBack={exitGuard.requestExit} />

      <div className={styles.content}>
        <div className={styles.leftContent}>
          <TeamActions groups={catalog.groups} session={data.session}/>
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
