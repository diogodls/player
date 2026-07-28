import styles from "./IndividualAnalysis.module.scss";
import VideoAnalysis from "../../../components/elements/VideoAnalysis/VideoAnalysis.tsx";
import ActionLog from "../../../components/elements/ActionLog/ActionLog.tsx";
import PlayerSelector from "../../../components/IndivididualAnalysis/PlayerSelector/PlayerSelector.tsx";
import {useApi} from "../../../hooks/useApi.ts";
import {useContext, useEffect, useState} from "react";
import ActionsModal from "../../../components/IndivididualAnalysis/ActionsModal/ActionsModal.tsx";
import type {AnalysisPlayerListResponse, IndividualCatalog} from "../index";
import type {Session} from "../../Sessions";
import SessionAnalysisHeader from "../../../components/elements/SessionAnalysisHeader/SessionAnalysisHeader.tsx";
import {ActionsContext} from "../../../contexts/ActionsContext/ActionsContext.tsx";
import { useSessionExitGuard } from "../../../hooks/useSessionExitGuard.ts";
import AnalysisExitModal from "../../../components/elements/AnalysisExitModal/AnalysisExitModal.tsx";
import {useParams} from "react-router";

const IndividualAnalysis = () => {
  const {id: sessionId} = useParams<{id: string}>();
  const { setIsTagging } = useContext(ActionsContext);
  const {data: session, isLoading: isSessionLoading, isError: sessionError} =
    useApi<Session>(sessionId ? `/sessions/${sessionId}` : null);
  const {data: playersResponse, isLoading: arePlayersLoading, isError: playersError} =
    useApi<AnalysisPlayerListResponse>(sessionId ? "/players?limit=100" : null);
  const {
    data: catalog,
    isLoading: isCatalogLoading,
    isError: catalogError,
  } = useApi<IndividualCatalog>("/catalog/actions/individual");
  const [actionsModalOpen, setActionsModalOpen] = useState(false);

  useEffect(() => {
    setIsTagging(actionsModalOpen);
  }, [actionsModalOpen, setIsTagging]);

  const exitGuard = useSessionExitGuard({
    logType: "individual",
    sessionId: sessionId ?? '0',
  });

  if (isSessionLoading || arePlayersLoading || isCatalogLoading) {
    return <div className={styles.feedback}>Carregando análise individual...</div>;
  }

  if (
    !sessionId ||
    sessionError ||
    playersError ||
    catalogError ||
    !session ||
    !playersResponse ||
    !catalog
  ) {
    return <div className={styles.feedback}>Não foi possível carregar a análise individual.</div>;
  }

  return (
    <div className={styles.container}>
      <SessionAnalysisHeader session={session} onBack={exitGuard.requestExit} />

      <div className={styles.content}>
        <div className={styles.leftContent}>
          <PlayerSelector players={playersResponse.data} setActionsModalOpen={setActionsModalOpen} />
        </div>
        <div className={styles.videoAnalysis}>
          <VideoAnalysis />
        </div>
        <div className={styles.actionLog}>
          <ActionLog logType={'individual'} session={session} />
        </div>
      </div>
      {actionsModalOpen && (
        <ActionsModal
          closeModal={() => setActionsModalOpen(false)}
          groups={catalog.groups}
          session={session}
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
