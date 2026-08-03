import { useMemo, useState } from "react";
import styles from "./CoachDashboard.module.scss";
import { useApi } from "../../hooks/useApi.ts";
import type { CoachDashboardResponse, Player } from "./index";
import HeaderDashboard from "../../components/CoachDashboard/HeaderDashboard/HeaderDashboard.tsx";
import PlayerComparison from "../../components/CoachDashboard/PlayerComparison/PlayerComparison.tsx";
import PlayersSection from "../../components/CoachDashboard/PlayersSection/PlayersSection.tsx";
import { PLAYERS_POSITIONS } from "../../constants/players.ts";
import TeamData from "../../components/CoachDashboard/TeamData/TeamData.tsx";
import PlayersFilter from "../../components/CoachDashboard/PlayersFilter/PlayersFilter.tsx";
import Select from "../../components/elements/Select/Select.tsx";
import type { Session, SessionListResponse } from "../Sessions";

type ViewMode = "team" | "individual" | "compare";
type PositionFilter = "all" | (typeof PLAYERS_POSITIONS)[number];
const ALL = "all";
const EMPTY_PLAYERS: Player[] = [];
const sessionLabel = (session: Session) =>
  session.description?.trim() ||
  `${session.type} — ${session.date.slice(0, 10)}`;

const CoachDashboard = () => {
  const [sessionId, setSessionId] = useState(ALL);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const invalidPeriod = Boolean(startDate && endDate && startDate > endDate);
  const endpoint = useMemo(() => {
    if (invalidPeriod) return null;
    const params = new URLSearchParams();
    if (sessionId !== ALL) params.set("sessionId", sessionId);
    if (startDate) params.set("startDate", startDate);
    if (endDate) params.set("endDate", endDate);
    const query = params.toString();
    return "/coach-dashboard" + (query ? "?" + query : "");
  }, [sessionId, startDate, endDate, invalidPeriod]);
  const { data, error, isLoading } = useApi<CoachDashboardResponse>(endpoint, {
    keepPreviousData: false,
  });
  const { data: sessionsResponse, error: sessionsError } =
    useApi<SessionListResponse>("/sessions?limit=100");
  const [viewMode, setViewMode] = useState<ViewMode>("team");
  const [positionFilter, setPositionFilter] = useState<PositionFilter>("all");
  const [nameFilter, setNameFilter] = useState("");
  const players = Array.isArray(data?.players) ? data.players : EMPTY_PLAYERS;
  const filteredPlayers = useMemo(() => {
    const name = nameFilter.trim().toLocaleLowerCase();
    return players.filter(
      (player) =>
        player.name.toLocaleLowerCase().includes(name) &&
        (positionFilter === "all" || player.position === positionFilter),
    );
  }, [players, nameFilter, positionFilter]);
  const clearFilters = () => {
    setSessionId(ALL);
    setStartDate("");
    setEndDate("");
  };
  const invalidContract =
    data &&
    (!Array.isArray(data.players) ||
      !Array.isArray(data.metrics) ||
      !Array.isArray(data.teamIndexes));

  return (
    <div className={styles.container}>
      <section aria-label="Filtros da dashboard">
        <label htmlFor="coach-session">Sessão</label>
        <Select
          id="coach-session"
          value={sessionId}
          onChange={(value) => setSessionId(value || ALL)}
          options={[
            { value: ALL, label: "Todas as sessões" },
            ...(sessionsResponse?.data ?? []).map((session) => ({
              value: session.id,
              label: sessionLabel(session),
            })),
          ]}
          disabled={Boolean(sessionsError)}
        />
        <label htmlFor="coach-start-date">Data inicial</label>
        <input
          id="coach-start-date"
          type="date"
          value={startDate}
          onChange={(event) => setStartDate(event.target.value)}
        />
        <label htmlFor="coach-end-date">Data final</label>
        <input
          id="coach-end-date"
          type="date"
          value={endDate}
          onChange={(event) => setEndDate(event.target.value)}
        />
        <button type="button" onClick={clearFilters}>
          Limpar filtros
        </button>
        {invalidPeriod && (
          <div role="alert">A data inicial deve ser anterior à data final.</div>
        )}
      </section>
      {isLoading && (
        <div className={styles.feedback}>Carregando dashboard...</div>
      )}
      {error && (
        <div className={styles.feedback}>
          Não foi possível carregar a dashboard.
        </div>
      )}
      {invalidContract && (
        <div role="alert" className={styles.feedback}>
          A dashboard recebeu dados inválidos.
        </div>
      )}
      {!isLoading && !error && !invalidPeriod && !invalidContract && data && (
        <>
          <HeaderDashboard viewMode={viewMode} onChangeView={setViewMode} />
          {viewMode === "team" && (
            <TeamData teamRelevantIndexes={data.teamIndexes} />
          )}
          {viewMode === "individual" && (
            <>
              <PlayersFilter
                position={positionFilter}
                onChangePosition={setPositionFilter}
                onNameChange={setNameFilter}
                nameFilter={nameFilter}
              />
              <PlayersSection players={filteredPlayers} />
            </>
          )}
          {viewMode === "compare" && (
            <PlayerComparison players={players} metrics={data.metrics} />
          )}
        </>
      )}
    </div>
  );
};
export default CoachDashboard;
