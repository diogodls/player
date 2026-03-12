import { useContext, useState } from "react";
import styles from "./SessionView.module.scss";
import HeaderSessionScreen from "../../components/RegistrationScreen/HeaderSessionScreen/HeaderSessionScreen";
import RegistrationScreen from "../../components/RegistrationScreen/RegistrationScreen";
import SaveSessionModal from "../../components/IndivididualAnalysis/SaveSessionModal/SaveSessionModal";
import { ToastContext } from "../../contexts/ToastContext/ToastContext";
import { useSessions } from "../../contexts/SessionsContext/SessionsContext";
import type { SessionMeta } from "./index";

const SessionView = () => {
  const { sessions, addSession } = useSessions();
  const { success } = useContext(ToastContext);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);

  const handleCreateSession = (meta: SessionMeta) => {
    const created = addSession(meta);
    success(`Registro ${created.type.toLowerCase()} criado com sucesso!`);
  };

  return (
    <div className={styles.container}>
      <HeaderSessionScreen onAddSession={() => setIsSaveModalOpen(true)} />
      <RegistrationScreen sessions={sessions} />

      <SaveSessionModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        onSubmit={handleCreateSession}
      />
    </div>
  );
};

export default SessionView;
