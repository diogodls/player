import styles from "./IndividualAnalysis.module.scss";
import VideoAnalysis from "../../components/elements/VideoAnalysis/VideoAnalysis.tsx";
import ActionLog from "../../components/IndivididualAnalysis/ActionLog/ActionLog.tsx";
import PlayerSelector from "../../components/IndivididualAnalysis/PlayerSelector/PlayerSelector.tsx";
import {useApi} from "../../hooks/useApi.ts";
import {useContext, useEffect, useState} from "react";
import ActionsModal from "../../components/IndivididualAnalysis/ActionsModal/ActionsModal.tsx";
import type {IndividualAnalysisData} from "./index";
import {ActionsContext} from "../../contexts/ActionsContext/ActionsContext";
import SessionAnalysisHeader from "../../components/elements/SessionAnalysisHeader/SessionAnalysisHeader.tsx";

const IndividualAnalysis = () => {
  const {data} = useApi<IndividualAnalysisData>("individual-analysis");
  //todo: refatorar pra isso vir junto da tela de individual analysis
  const { setActions, setSelectedPlayer } = useContext(ActionsContext);
  // const { id } = useParams<{ id: string }>(); todo: usar para requisição futura
  const [actionsModalOpen, setActionsModalOpen] = useState(false);

  useEffect(() => {
    setActions([]);
    setSelectedPlayer(null);
  }, [setActions, setSelectedPlayer]);

  if (!data) return;

  return (
    <div className={styles.container}>
      <SessionAnalysisHeader session={data.session} />

      <div className={styles.content}>
        <div className={styles.leftContent}>
          <PlayerSelector players={data?.players ?? []} setActionsModalOpen={setActionsModalOpen} />
        </div>
        <div className={styles.videoAnalysis}>
          <VideoAnalysis />
        </div>
        <div className={styles.actionLog}>
          <ActionLog session={data.session} />
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
