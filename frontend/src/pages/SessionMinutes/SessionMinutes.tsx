import axios from "axios";
import { useContext, useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faStopwatch } from "@fortawesome/free-solid-svg-icons";
import { useNavigate, useParams } from "react-router";
import SessionDetails from "../../components/elements/SessionDetails/SessionDetails";
import { ToastContext } from "../../contexts/ToastContext/ToastContext";
import { useApi } from "../../hooks/useApi";
import type { Session } from "../Sessions";
import { backendApi } from "../../utils/api";
import {
  displayedPlayingSeconds,
  formatPlayingTime,
  parsePlayingTime,
} from "../../utils/playingTime";
import type { PlayerSessionMinutes } from "./index";
import styles from "./SessionMinutes.module.scss";

function apiErrorMessage(caughtError: unknown) {
  if (!axios.isAxiosError(caughtError)) return "Não foi possível atualizar a minutagem.";
  const message = caughtError.response?.data?.message;
  return typeof message === "string"
    ? message
    : "Não foi possível atualizar a minutagem.";
}

const SessionMinutes = () => {
  const { id: sessionId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useContext(ToastContext);
  const [nowMs, setNowMs] = useState(Date.now());
  const [pendingPlayers, setPendingPlayers] = useState<Set<string>>(new Set());
  const pendingPlayersRef = useRef(new Set<string>());
  const [editingPlayerId, setEditingPlayerId] = useState<string | null>(null);
  const [manualValue, setManualValue] = useState("");
  const [manualError, setManualError] = useState<string | null>(null);
  const {
    data: session,
    isLoading: isSessionLoading,
    isError: sessionError,
  } = useApi<Session>(sessionId ? `/sessions/${sessionId}` : null);
  const {
    data: players,
    isLoading: areMinutesLoading,
    isError: minutesError,
    mutate,
  } = useApi<PlayerSessionMinutes[]>(
    sessionId ? `/sessions/${sessionId}/minutes` : null,
  );

  useEffect(() => {
    if (!players?.some((player) => player.isActive)) return;
    setNowMs(Date.now());
    const interval = window.setInterval(() => setNowMs(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, [players]);

  const runPlayerRequest = async (
    playerId: string,
    request: () => Promise<unknown>,
  ) => {
    if (pendingPlayersRef.current.has(playerId)) return false;
    pendingPlayersRef.current.add(playerId);
    setPendingPlayers(new Set(pendingPlayersRef.current));
    try {
      await request();
      await mutate();
      return true;
    } catch (caughtError) {
      toast.error(apiErrorMessage(caughtError));
      return false;
    } finally {
      pendingPlayersRef.current.delete(playerId);
      setPendingPlayers(new Set(pendingPlayersRef.current));
    }
  };

  const beginEditing = (player: PlayerSessionMinutes) => {
    if (player.isActive) return;
    setEditingPlayerId(player.playerId);
    setManualValue(formatPlayingTime(player.totalSeconds));
    setManualError(null);
  };

  const saveManualTime = async (playerId: string) => {
    const totalSeconds = parsePlayingTime(manualValue);
    if (totalSeconds === null) {
      setManualError("Informe o tempo no formato MM:SS, com segundos entre 00 e 59.");
      return;
    }
    const saved = await runPlayerRequest(playerId, () =>
      backendApi.put(`/sessions/${sessionId}/minutes/${playerId}`, {
        totalSeconds,
      }),
    );
    if (saved) {
      setEditingPlayerId(null);
      setManualError(null);
    }
  };

  if (isSessionLoading || areMinutesLoading) {
    return <main className={styles.feedback}>Carregando minutagem...</main>;
  }
  if (!sessionId || sessionError || minutesError || !session || !players) {
    return <main className={styles.feedback}>Não foi possível carregar a minutagem.</main>;
  }

  return (
    <main className={styles.container}>
      <div className={styles.contentWrap}>
        <header className={styles.header}>
          <button
            type="button"
            className={styles.backButton}
            aria-label="Voltar para detalhes da sessão"
            onClick={() => navigate(`/sessions/${sessionId}`)}
          >
            <FontAwesomeIcon icon={faArrowLeft} />
          </button>
          <div>
            <span className={styles.eyebrow}>Controle por atleta</span>
            <h1>Minutagem</h1>
            <p>Registre entradas, saídas e ajustes manuais desta sessão.</p>
          </div>
        </header>

        <SessionDetails session={session} />

        <section className={styles.minutesSection}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionIcon}>
              <FontAwesomeIcon icon={faStopwatch} />
            </div>
            <div>
              <h2>Ao vivo</h2>
              <p>Os cronômetros ativos continuam correndo independentemente.</p>
            </div>
          </div>

          {players.length === 0 ? (
            <div className={styles.empty}>Nenhum atleta disponível.</div>
          ) : (
            <div className={styles.playersGrid}>
              {players.map((player) => {
                const isPending = pendingPlayers.has(player.playerId);
                const isEditing = editingPlayerId === player.playerId;
                const displayedSeconds = displayedPlayingSeconds(
                  player.totalSeconds,
                  player.activeSince,
                  player.isActive,
                  nowMs,
                );
                return (
                  <article
                    key={player.playerId}
                    className={`${styles.playerCard} ${player.isActive ? styles.activeCard : ""}`}
                  >
                    <div className={styles.playerHeader}>
                      <div>
                        <h3>{player.name}</h3>
                        <span>{player.position ?? "Posição não informada"}</span>
                      </div>
                      <span
                        className={`${styles.status} ${player.isActive ? styles.activeStatus : ""}`}
                      >
                        <span className={styles.statusDot} />
                        {player.isActive ? "Em quadra" : "Fora"}
                      </span>
                    </div>

                    <strong className={styles.timer} aria-label={`Minutagem de ${player.name}`}>
                      {formatPlayingTime(displayedSeconds)}
                    </strong>

                    <div className={styles.actions}>
                      <button
                        type="button"
                        className={player.isActive ? styles.stopButton : styles.startButton}
                        disabled={isPending}
                        onClick={() =>
                          runPlayerRequest(player.playerId, () =>
                            backendApi.post(
                              `/sessions/${sessionId}/minutes/${player.playerId}/${
                                player.isActive ? "stop" : "start"
                              }`,
                            ),
                          )
                        }
                      >
                        {isPending
                          ? "Salvando..."
                          : player.isActive
                            ? "Sair"
                            : "Entrar"}
                      </button>
                      <button
                        type="button"
                        className={styles.editButton}
                        disabled={player.isActive || isPending}
                        title={
                          player.isActive
                            ? "Encerre o período ativo antes de editar"
                            : undefined
                        }
                        onClick={() => beginEditing(player)}
                      >
                        Editar minutagem
                      </button>
                    </div>

                    {isEditing && !player.isActive && (
                      <form
                        className={styles.manualForm}
                        onSubmit={(event) => {
                          event.preventDefault();
                          void saveManualTime(player.playerId);
                        }}
                      >
                        <label htmlFor={`minutes-${player.playerId}`}>Tempo (MM:SS)</label>
                        <div className={styles.manualControls}>
                          <input
                            id={`minutes-${player.playerId}`}
                            value={manualValue}
                            onChange={(event) => {
                              setManualValue(event.target.value);
                              setManualError(null);
                            }}
                            placeholder="35:30"
                            inputMode="numeric"
                            autoFocus
                            required
                          />
                          <button type="submit" disabled={isPending}>Salvar</button>
                          <button
                            type="button"
                            disabled={isPending}
                            onClick={() => setEditingPlayerId(null)}
                          >
                            Cancelar
                          </button>
                        </div>
                        {manualError && <span role="alert">{manualError}</span>}
                      </form>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
};

export default SessionMinutes;
