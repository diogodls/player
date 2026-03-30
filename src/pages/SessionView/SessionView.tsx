import { useContext, useMemo, useState } from "react";
import styles from "./SessionView.module.scss";
import HeaderSessionScreen from "../../components/RegistrationScreen/HeaderSessionScreen/HeaderSessionScreen";
import RegistrationScreen from "../../components/RegistrationScreen/RegistrationScreen";
import SaveSessionModal from "../../components/IndivididualAnalysis/SaveSessionModal/SaveSessionModal";
import { ToastContext } from "../../contexts/ToastContext/ToastContext";
import { useSessions } from "../../contexts/SessionsContext/SessionsContext";
import type { Session, SessionMeta } from "./index";
import DeleteSessionModal from "../../components/RegistrationScreen/DeleteSessionModal/DeleteSessionModal.tsx";

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

const SessionView = () => {
  const { sessions, addSession, updateSession, deleteSession } = useSessions();
  const { success } = useContext(ToastContext);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [sessionBeingEdited, setSessionBeingEdited] = useState<Session | null>(null);
  const [sessionPendingDelete, setSessionPendingDelete] = useState<Session | null>(null);

  const editingMeta = useMemo(
    () => (sessionBeingEdited ? toSessionMeta(sessionBeingEdited) : null),
    [sessionBeingEdited]
  );

  const handleCreateSession = (meta: SessionMeta) => {
    const created = addSession(meta);
    success(`Registro ${created.type.toLowerCase()} criado com sucesso!`);
  };

  const handleEditSession = (session: Session) => {
    setSessionBeingEdited(session);
    setIsSaveModalOpen(true);
  };

  const handleDeleteSession = (session: Session) => {
    setSessionPendingDelete(session);
  };

  const handleConfirmDelete = () => {
    if (!sessionPendingDelete) return;

    deleteSession(sessionPendingDelete.id);
    success("Treino/Jogo removido com sucesso");
    setSessionPendingDelete(null);
  };

  const handleSubmit = (meta: SessionMeta) => {
    if (sessionBeingEdited) {
      const updated = updateSession(sessionBeingEdited.id, meta);
      if (!updated) return;
      success(`${updated.type} atualizado com sucesso!`);
      return;
    }

    handleCreateSession(meta);
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

  return (
    <div className={styles.container}>
      <HeaderSessionScreen onAddSession={handleOpenCreate} />
      <RegistrationScreen
        sessions={sessions}
        onEditSession={handleEditSession}
        onDeleteSession={handleDeleteSession}
      />

      <SaveSessionModal
        key={sessionBeingEdited ? `edit-${sessionBeingEdited.id}` : `create-${isSaveModalOpen ? "open" : "closed"}`}
        isOpen={isSaveModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        initialMeta={editingMeta}
        mode={sessionBeingEdited ? "edit" : "create"}
      />

      <DeleteSessionModal
        isOpen={Boolean(sessionPendingDelete)}
        session={sessionPendingDelete}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};

export default SessionView;
