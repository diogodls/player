import styles from "./IndividualAnalysis.module.scss";
import VideoAnalysis from "../../components/elements/VideoAnalysis/VideoAnalysis.tsx";
import ActionLog from "../../components/IndivididualAnalysis/ActionLog/ActionLog.tsx";
import PlayerSelector from "../../components/IndivididualAnalysis/PlayerSelector/PlayerSelector.tsx";
import {useApi} from "../../hooks/useApi.ts";
import {useContext, useEffect, useMemo, useState} from "react";
import ActionsModal from "../../components/IndivididualAnalysis/ActionsModal/ActionsModal.tsx";
import type {IndividualAnalysisData} from "./index";
import {useSessions} from "../../contexts/SessionsContext/SessionsContext";
import {Navigate, useParams} from "react-router";
import {ActionsContext} from "../../contexts/ActionsContext/ActionsContext";
import SessionAnalysisHeader from "../../components/SessionAnalysis/SessionAnalysisHeader/SessionAnalysisHeader.tsx";
import SessionAnalysisDetails from "../../components/SessionAnalysis/SessionAnalysisDetails/SessionAnalysisDetails.tsx";

const IndividualAnalysis = () => {
  const {data} = useApi<IndividualAnalysisData>("individual-analysis");
  const { sessions } = useSessions();
  const { setActions, setSelectedPlayer } = useContext(ActionsContext);
  const { id } = useParams<{ id: string }>();
  const [actionsModalOpen, setActionsModalOpen] = useState(false);

  const selectedSession = useMemo(
    () => sessions.find((session) => session.id === id),
    [sessions, id]
  );

  useEffect(() => {
    setActions([]);
    setSelectedPlayer(null);
  }, [selectedSession?.id, setActions, setSelectedPlayer]);

  if (!id || !selectedSession) {
    return <Navigate to="/session-screen" replace />;
  }

  return (
    <div className={styles.container}>
      <SessionAnalysisHeader sessionId={selectedSession.id} />
      <SessionAnalysisDetails session={selectedSession} />

      <div className={styles.content}>
        <div className={styles.leftContent}>
          <PlayerSelector players={data?.players ?? []} setActionsModalOpen={setActionsModalOpen} />
        </div>
        <div className={styles.videoAnalysis}>
          <VideoAnalysis />
        </div>
        <div className={styles.actionLog}>
          <ActionLog session={selectedSession} />
        </div>
      </div>
      {actionsModalOpen && (
        <ActionsModal
          closeModal={() => setActionsModalOpen(false)}
          actions={data?.actions ?? []}
        />
      )}
    </div>
  );
};

export default IndividualAnalysis;
