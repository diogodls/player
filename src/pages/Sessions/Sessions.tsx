import { useMemo, useState } from "react";
import styles from "./Sessions.module.scss";
import HeaderSessionScreen from "../../components/RegistrationScreen/HeaderSessionScreen/HeaderSessionScreen";
import SessionsList from "../../components/RegistrationScreen/SessionsList";
import SaveSessionModal from "../../components/IndivididualAnalysis/SaveSessionModal/SaveSessionModal";
import { useApi } from "../../hooks/useApi";
import type { Session, SessionData, SessionMeta } from "./index";
import DeleteSessionModal from "../../components/RegistrationScreen/DeleteSessionModal/DeleteSessionModal.tsx"; //todo: trocar nome da pasta para SessionsList

function toSessionMeta(session: Session): SessionMeta {
  return {
    type: session.type,
    date: session.date,
    local: session.local,
    ...(session.type === "Treino"
      ? { description: session.description ?? "" }
      : { opponent: session.opponent ?? "" }),
  };
}

const Sessions = () => {
  const { data } = useApi<SessionData>("sessions");
  const sessions = data ?? [];
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [sessionBeingEdited, setSessionBeingEdited] = useState<Session | null>(null);
  const [sessionPendingDelete, setSessionPendingDelete] = useState<Session | null>(null);

  const editingMeta = useMemo(
    () => (sessionBeingEdited ? toSessionMeta(sessionBeingEdited) : null),
    [sessionBeingEdited]
  );

  const handleEditSession = (session: Session) => {
    setSessionBeingEdited(session);
    setIsSaveModalOpen(true);
  };

  const handleDeleteSession = (session: Session) => {
    setSessionPendingDelete(session);
  };

  const handleOpenCreate = () => {
    setSessionBeingEdited(null);
    setIsSaveModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsSaveModalOpen(false);
    setSessionBeingEdited(null);
  };

  const handleCloseDeleteModal = () => {
    setSessionPendingDelete(null);
  };
  //todo: ideal aqui é separar toda essa lógica de modais do componente de página também.
  return (
    <div className={styles.container}>
      <HeaderSessionScreen onAddSession={handleOpenCreate} />
      <SessionsList
        sessions={sessions}
        onEditSession={handleEditSession}
        onDeleteSession={handleDeleteSession}
      />

      <SaveSessionModal
        isOpen={isSaveModalOpen}
        onClose={handleCloseModal}
        initialMeta={editingMeta}
        mode={sessionBeingEdited ? "edit" : "create"}
      />

      <DeleteSessionModal
        isOpen={Boolean(sessionPendingDelete)}
        session={sessionPendingDelete}
        onClose={handleCloseDeleteModal}
      />
    </div>
  );
};

export default Sessions;
