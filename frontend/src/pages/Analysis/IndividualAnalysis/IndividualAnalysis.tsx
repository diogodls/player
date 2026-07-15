import styles from "./IndividualAnalysis.module.scss";
import VideoAnalysis from "../../../components/elements/VideoAnalysis/VideoAnalysis.tsx";
import ActionLog from "../../../components/elements/ActionLog/ActionLog.tsx";
import PlayerSelector from "../../../components/IndivididualAnalysis/PlayerSelector/PlayerSelector.tsx";
import {useApi} from "../../../hooks/useApi.ts";
import {useContext, useEffect, useState} from "react";
import ActionsModal from "../../../components/IndivididualAnalysis/ActionsModal/ActionsModal.tsx";
import type {IndividualAnalysisData, IndividualCatalog} from "../index";
import SessionAnalysisHeader from "../../../components/elements/SessionAnalysisHeader/SessionAnalysisHeader.tsx";
import {ActionsContext} from "../../../contexts/ActionsContext/ActionsContext.tsx";
import { useSessionExitGuard } from "../../../hooks/useSessionExitGuard.ts";
import AnalysisExitModal from "../../../components/elements/AnalysisExitModal/AnalysisExitModal.tsx";
import {mockApi} from "../../../utils/api.ts";

const IndividualAnalysis = () => {
  const { setIsTagging } = useContext(ActionsContext);
  const {data, isLoading: isAnalysisLoading, isError: analysisError} =
    useApi<IndividualAnalysisData>("individual-analysis", { client: mockApi });
  const {
    data: catalog,
    isLoading: isCatalogLoading,
    isError: catalogError,
  } = useApi<IndividualCatalog>("catalog/actions/individual");
  // const { id } = useParams<{ id: string }>(); todo: usar para requisição futura
  const [actionsModalOpen, setActionsModalOpen] = useState(false);

  useEffect(() => {
    setIsTagging(actionsModalOpen);
  }, [actionsModalOpen, setIsTagging]);

  const exitGuard = useSessionExitGuard({
    logType: "individual",
    sessionId: data?.session ? data.session.id : '0',
  });

  if (isAnalysisLoading || isCatalogLoading) {
    return <div className={styles.feedback}>Carregando análise individual...</div>;
  }

  if (analysisError || catalogError || !data || !catalog) {
    return <div className={styles.feedback}>Não foi possível carregar a análise individual.</div>;
  }

  return (
    <div className={styles.container}>
      <SessionAnalysisHeader session={data.session} onBack={exitGuard.requestExit} />

      <div className={styles.content}>
        <div className={styles.leftContent}>
          <PlayerSelector players={data?.players ?? []} setActionsModalOpen={setActionsModalOpen} />
        </div>
        <div className={styles.videoAnalysis}>
          <VideoAnalysis />
        </div>
        <div className={styles.actionLog}>
          <ActionLog logType={'individual'} session={data.session} />
        </div>
      </div>
      {actionsModalOpen && (
        <ActionsModal
          closeModal={() => setActionsModalOpen(false)}
          groups={catalog.groups}
          session={data.session}
        />
      )}

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

export default IndividualAnalysis;
