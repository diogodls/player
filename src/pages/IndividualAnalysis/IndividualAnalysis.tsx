import styles from "./IndividualAnalysis.module.scss";
import VideoAnalysis from "../../components/elements/VideoAnalysis/VideoAnalysis.tsx";
import ActionLog from "../../components/IndivididualAnalysis/ActionLog/ActionLog.tsx";
import PlayerSelector from "../../components/IndivididualAnalysis/PlayerSelector/PlayerSelector.tsx";
import {useApi} from "../../hooks/useApi.ts";
import {useContext, useEffect, useMemo, useState} from "react";
import ActionsModal from "../../components/IndivididualAnalysis/ActionsModal/ActionsModal.tsx";
import type {IndividualAnalysisData} from "./index";
import {useSessions} from "../../contexts/SessionsContext/SessionsContext";
import {useSearchParams} from "react-router";
import {ActionsContext} from "../../contexts/ActionsContext/ActionsContext";

const IndividualAnalysis = () => {
  const {data} = useApi<IndividualAnalysisData>("individual-analysis");
  const { sessions } = useSessions();
  const { setActions, setSelectedPlayer } = useContext(ActionsContext);
  const [searchParams] = useSearchParams();
  const [actionsModalOpen, setActionsModalOpen] = useState(false);

  const initialSessionId = searchParams.get("sessionId") ?? sessions[0]?.id ?? "";
  const [selectedSessionId, setSelectedSessionId] = useState(initialSessionId);

  useEffect(() => {
    const requestedSessionId = searchParams.get("sessionId");

    if (requestedSessionId && sessions.some((session) => session.id === requestedSessionId)) {
      setSelectedSessionId(requestedSessionId);
      return;
    }

    if (!sessions.some((session) => session.id === selectedSessionId)) {
      setSelectedSessionId(sessions[0]?.id ?? "");
    }
  }, [searchParams, sessions, selectedSessionId]);

  useEffect(() => {
    setActions([]);
    setSelectedPlayer(null);
  }, [selectedSessionId, setActions, setSelectedPlayer]);

  const selectedSession = useMemo(
    () => sessions.find((session) => session.id === selectedSessionId),
    [sessions, selectedSessionId]
  );

  if (!selectedSession) {
    return (
      <div className={styles.container}>
        <div className={styles.emptySessions}>
          <h2>Nenhum treino/jogo disponível para análise</h2>
          <p>Cadastre um treino/jogo na tela "Treinos e Jogos" para iniciar uma análise.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.sessionSelectorCard}>
        <span className={styles.sessionSelectorLabel}>Treino/jogo da análise</span>
        <div className={styles.sessionSelectorRow}>
          <select
            className={styles.sessionSelector}
            value={selectedSessionId}
            onChange={(event) => setSelectedSessionId(event.target.value)}
          >
            {sessions.map((session) => (
              <option key={session.id} value={session.id}>
                {session.type} - {session.date} - {session.local}
              </option>
            ))}
          </select>

          <span className={styles.sessionSummary}>
            {selectedSession.type === "Treino"
              ? selectedSession.description
              : `vs ${selectedSession.opponent}`}
          </span>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.leftContent}>
          <PlayerSelector players={data?.players ?? []} setActionsModalOpen={setActionsModalOpen}/>
        </div>
        <div className={styles.videoAnalysis}>
          <VideoAnalysis/>
        </div>
        <div className={styles.actionLog}>
          <ActionLog session={selectedSession} />
        </div>
      </div>
      {actionsModalOpen && <ActionsModal
        closeModal={() => setActionsModalOpen(false)}
        actions={data?.actions ?? []}/>}
    </div>
  );
};

export default IndividualAnalysis;
