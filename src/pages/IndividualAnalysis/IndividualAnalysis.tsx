import styles from "./IndividualAnalysis.module.scss";
import VideoAnalysis from "../../components/VideoAnalysis/VideoAnalysis.tsx";
import ActionLog from "../../components/ActionLog/ActionLog.tsx";
import PlayerSelector from "../../components/PlayerSelector/PlayerSelector.tsx";
import {useApi} from "../../hooks/useApi.ts";
import {useState} from "react";
import ActionsModal from "../../components/ActionsModal/ActionsModal.tsx";
import type {IndividualAnalysisData} from "./index";

const IndividualAnalysis = () => {
  const { data } = useApi<IndividualAnalysisData>("individual-analisis");
  const [actionsModalOpen, setActionsModalOpen] = useState(false);

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.leftContent}>
          <PlayerSelector players={data?.players ?? []} setActionsModalOpen={setActionsModalOpen}/>
        </div>
        <div className={styles.rightContent}>
          <VideoAnalysis/>
          <ActionLog/>
        </div>
      </div>
      {actionsModalOpen && <ActionsModal
        closeModal={() => setActionsModalOpen(false)}
        actions={data?.actions ?? []}/>}
    </div>
  );
};

export default IndividualAnalysis;
