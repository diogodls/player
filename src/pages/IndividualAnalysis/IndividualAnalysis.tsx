import styles from "./IndividualAnalysis.module.scss";
import VideoAnalysis from "../../components/elements/VideoAnalysis/VideoAnalysis.tsx";
import ActionLog from "../../components/IndivididualAnalysis/ActionLog/ActionLog.tsx";
import PlayerSelector from "../../components/IndivididualAnalysis/PlayerSelector/PlayerSelector.tsx";
import {useApi} from "../../hooks/useApi.ts";
import {useState} from "react";
import ActionsModal from "../../components/IndivididualAnalysis/ActionsModal/ActionsModal.tsx";
import type {IndividualAnalysisData} from "./index";

const IndividualAnalysis = () => {
  const {data} = useApi<IndividualAnalysisData>("individual-analysis");
  const [actionsModalOpen, setActionsModalOpen] = useState(false);

  return (
    <div className={styles.container}>
      <HeaderAnalysis
        onSave={() => console.log("Salvar")}
        onClear={() => console.log("Limpar")}
      />
      <div className={styles.content}>
        <div className={styles.leftContent}>
          <PlayerSelector players={data?.players ?? []} setActionsModalOpen={setActionsModalOpen}/>
        </div>
        <div className={styles.videoAnalysis}>
          <VideoAnalysis/>
        </div>
        <div className={styles.actionLog}>
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
