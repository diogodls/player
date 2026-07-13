import { useContext, useMemo, useState } from "react";
import styles from "./Sessions.module.scss";
import HeaderSessionScreen from "../../components/SessionsList/HeaderSessionScreen/HeaderSessionScreen";
import SessionsList from "../../components/SessionsList/SessionsList";
import SaveSessionModal from "../../components/IndivididualAnalysis/SaveSessionModal/SaveSessionModal";
import { useApi } from "../../hooks/useApi";
import { backendApi } from "../../utils/api.ts";
import type {
  Session,
  SessionFilters,
  SessionListResponse,
  SessionMeta,
} from "./index";
import DeleteSessionModal from "../../components/SessionsList/DeleteSessionModal/DeleteSessionModal.tsx";
import {
  SESSION_COURT_SIZE_IDS,
  SESSION_LOCATION_IDS,
  SESSION_TYPE_IDS,
} from "../../constants/sessions.ts";
import { ToastContext } from "../../contexts/ToastContext/ToastContext.tsx";

const SESSIONS_PER_PAGE = 5;

function toSessionMeta(session: Session): SessionMeta {
  return {
    type: session.type,
    date: session.date,
    local: session.local,
    courtSize: session.courtSize,
    description: session.description ?? session.opponent ?? "",
  };
}

const Sessions = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<SessionFilters>({
    type: "all",
    date: "",
    local: "all",
  });
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [sessionBeingEdited, setSessionBeingEdited] = useState<Session | null>(null);
  const [sessionPendingDelete, setSessionPendingDelete] = useState<Session | null>(null);
  const { success, info, error } = useContext(ToastContext);

  const sessionsEndpoint = useMemo(() => {
    const searchParams = new URLSearchParams();
    if (filters.type !== "all") {
      searchParams.set("typeId", String(SESSION_TYPE_IDS[filters.type]));
    }
    if (filters.local !== "all") {
      searchParams.set("locationId", String(SESSION_LOCATION_IDS[filters.local]));
    }
    if (filters.date) searchParams.set("date", filters.date);
    searchParams.set("page", String(currentPage));
    searchParams.set("limit", String(SESSIONS_PER_PAGE));

    return `/sessions?${searchParams.toString()}`;
  }, [currentPage, filters]);

  const {
    data: sessionsResponse,
    error: sessionsError,
    isLoading,
    mutate,
  } = useApi<SessionListResponse>(sessionsEndpoint);
  const sessions = sessionsResponse?.data ?? [];
  const totalSessions = sessionsResponse?.total ?? 0;
  const totalPages = sessionsResponse?.totalPages ?? 1;
  const safeCurrentPage = sessionsResponse?.page ?? currentPage;

  const editingMeta = useMemo(
    () => (sessionBeingEdited ? toSessionMeta(sessionBeingEdited) : null),
    [sessionBeingEdited],
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

  const handleFiltersChange = (nextFilters: SessionFilters) => {
    setFilters(nextFilters);
    setCurrentPage(1);
  };

  const handleSubmitSession = async (values: SessionMeta) => {
    const payload = {
      id: sessionBeingEdited?.id ?? null,
      typeId: SESSION_TYPE_IDS[values.type],
      locationId: SESSION_LOCATION_IDS[values.local],
      courtSizeId: SESSION_COURT_SIZE_IDS[values.courtSize],
      date: values.date,
      description: values.description,
    };

    try {
      if (sessionBeingEdited) {
        await backendApi.put<Session>(`/sessions/${sessionBeingEdited.id}`, payload);
      } else {
        await backendApi.post<Session>("/sessions", payload);
      }
    } catch {
      error("Não foi possível salvar a sessão.");
      return;
    }

    void mutate().catch(() => {
      error("Não foi possível atualizar a lista de sessões.");
    });
    setCurrentPage(1);
    success(`Sessão ${sessionBeingEdited ? "editada" : "criada"}!`);
    setIsSaveModalOpen(false);
    setSessionBeingEdited(null);
  };

  const handleConfirmDelete = async () => {
    if (!sessionPendingDelete) return;

    try {
      await backendApi.delete(`/sessions/${sessionPendingDelete.id}`);
    } catch {
      error("Não foi possível excluir a sessão.");
      return;
    }

    void mutate().catch(() => {
      error("Não foi possível atualizar a lista de sessões.");
    });
    setSessionPendingDelete(null);
    info("Sessão deletada!");
  };

  return (
    <div className={styles.container}>
      <HeaderSessionScreen onAddSession={handleOpenCreate} />
      <SessionsList
        sessions={sessions}
        total={totalSessions}
        currentPage={safeCurrentPage}
        totalPages={totalPages}
        isLoading={isLoading}
        isError={Boolean(sessionsError)}
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onPageChange={setCurrentPage}
        onEdit={handleEditSession}
        onDelete={handleDeleteSession}
      />

      <SaveSessionModal
        isOpen={isSaveModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmitSession}
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

export default Sessions;
