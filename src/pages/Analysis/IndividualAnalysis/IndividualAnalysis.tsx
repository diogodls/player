import styles from "./IndividualAnalysis.module.scss";
import VideoAnalysis from "../../../components/elements/VideoAnalysis/VideoAnalysis.tsx";
import ActionLog from "../../../components/elements/ActionLog/ActionLog.tsx";
import PlayerSelector from "../../../components/IndivididualAnalysis/PlayerSelector/PlayerSelector.tsx";
import {useApi} from "../../../hooks/useApi.ts";
import {useContext, useEffect, useState} from "react";
import ActionsModal from "../../../components/IndivididualAnalysis/ActionsModal/ActionsModal.tsx";
import type {AnalysisData} from "../index";
import {ActionsContext} from "../../../contexts/ActionsContext/ActionsContext.tsx";

const IndividualAnalysis = () => {
  const {data} = useApi<AnalysisData>("individual-analysis");
  const {setIsTagging} = useContext(ActionsContext);
  const [actionsModalOpen, setActionsModalOpen] = useState(false);

  useEffect(() => {
    if (actionsModalOpen) {
      setIsTagging(true);
    }
  }, [actionsModalOpen, setIsTagging]);

  const handleCloseModal = () => {
    setActionsModalOpen(false);
    setIsTagging(false);
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.leftContent}>
          <PlayerSelector players={data?.players ?? []} setActionsModalOpen={setActionsModalOpen}/>
        </div>
        <div className={styles.videoAnalysis}>
          <VideoAnalysis/>
        </div>
        <div className={styles.actionLog}>
          <ActionLog logType={'individual'}/>
        </div>
      </div>
      {actionsModalOpen &&
        <ActionsModal
          closeModal={handleCloseModal}
          actions={data?.actions ?? []}
        />
      }
    </div>
  );
};

export default IndividualAnalysis;
