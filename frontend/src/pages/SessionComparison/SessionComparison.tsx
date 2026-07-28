import { useMemo, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faArrowTrendDown,
  faArrowTrendUp,
  faCalendarDays,
  faChartLine,
  faCheck,
  faCircleInfo,
  faClock,
  faMinus,
  faPlus,
  faRotateRight,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate, useSearchParams } from "react-router";
import { PLAYER_COLORS } from "../../constants/metrics";
import { SESSION_TYPE_IDS } from "../../constants/sessions";
import { useApi } from "../../hooks/useApi";
import type {
  ComparisonAthlete,
  SessionComparisonResponse,
} from "./index";
import {
  formatMetricValue,
  getMetricSummary,
  getTrend,
} from "./comparisonMetrics";
import ComparisonIndexCharts from "./ComparisonIndexCharts";
import styles from "./SessionComparison.module.scss";

type SessionTypeFilter = "all" | "1" | "2";

const TREND_CONTENT = {
  improved: {
    label: "Melhora",
    icon: faArrowTrendUp,
    className: styles.trendPositive,
  },
  declined: {
    label: "Queda",
    icon: faArrowTrendDown,
    className: styles.trendNegative,
  },
  stable: {
    label: "Estável",
    icon: faMinus,
    className: styles.trendStable,
  },
  changed: {
    label: "Variação de volume",
    icon: faArrowTrendUp,
    className: styles.trendNeutral,
  },
  unavailable: {
    label: "Sem comparação",
    icon: faMinus,
    className: styles.trendNeutral,
  },
} as const;

function isValidRange(startDate: string, endDate: string) {
  return Boolean(startDate && endDate && startDate < endDate);
}

function countPeriodDays(startDate: string, endDate: string) {
  const start = new Date(`${startDate}T00:00:00.000Z`).getTime();
  const end = new Date(`${endDate}T00:00:00.000Z`).getTime();
  return Math.round((end - start) / 86_400_000) + 1;
}

function getPerformanceSummary(athlete: ComparisonAthlete) {
  return getMetricSummary(
    athlete.points,
    "performancePercentage",
    athlete.id,
    false,
  );
}

function EmptyState({
  title,
  text,
  action,
}: {
  title: string;
  text: string;
  action?: ReactNode;
}) {
  return (
    <div className={styles.emptyState}>
      <FontAwesomeIcon icon={faCircleInfo} className={styles.emptyIcon} />
      <strong>{title}</strong>
      <span>{text}</span>
      {action}
    </div>
  );
}

const SessionComparison = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const appliedStartDate = searchParams.get("startDate") ?? "";
  const appliedEndDate = searchParams.get("endDate") ?? "";
  const appliedTypeId = searchParams.get("typeId");
  const [startDate, setStartDate] = useState(appliedStartDate);
  const [endDate, setEndDate] = useState(appliedEndDate);
  const [typeFilter, setTypeFilter] = useState<SessionTypeFilter>(
    appliedTypeId === "1" || appliedTypeId === "2" ? appliedTypeId : "all",
  );
  const hasAppliedRange = isValidRange(appliedStartDate, appliedEndDate);

  const endpoint = useMemo(() => {
    if (!hasAppliedRange) return null;
    const params = new URLSearchParams({
      startDate: appliedStartDate,
      endDate: appliedEndDate,
    });
    if (appliedTypeId === "1" || appliedTypeId === "2") {
      params.set("typeId", appliedTypeId);
    }
    return `/sessions/comparison?${params.toString()}`;
  }, [
    appliedEndDate,
    appliedStartDate,
    appliedTypeId,
    hasAppliedRange,
  ]);

  const {
    data,
    error,
    isLoading,
    isValidating,
    mutate,
  } = useApi<SessionComparisonResponse>(endpoint, {
    keepPreviousData: false,
  });

  const requestedAthleteIds = (
    searchParams.get("athleteIds") ?? searchParams.get("athleteId") ?? ""
  )
    .split(",")
    .filter(Boolean)
    .slice(0, 4);
  const selectedAthletes = data
    ? requestedAthleteIds.length > 0
      ? requestedAthleteIds.flatMap((id) => {
          const athlete = data.athletes.find((item) => item.id === id);
          return athlete ? [athlete] : [];
        })
      : data.athletes.slice(0, 1)
    : [];
  const selectedAthleteIds = selectedAthletes.map((athlete) => athlete.id);
  const selectionIsFull = selectedAthletes.length >= 4;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isValidRange(startDate, endDate)) return;

    const nextParams = new URLSearchParams({
      startDate,
      endDate,
    });
    if (typeFilter !== "all") nextParams.set("typeId", typeFilter);
    setSearchParams(nextParams);
  };

  const toggleAthlete = (athleteId: string) => {
    const isSelected = selectedAthleteIds.includes(athleteId);
    if (isSelected && selectedAthleteIds.length === 1) return;
    if (!isSelected && selectionIsFull) return;

    const nextIds = isSelected
      ? selectedAthleteIds.filter((id) => id !== athleteId)
      : [...selectedAthleteIds, athleteId];
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete("athleteId");
    nextParams.set("athleteIds", nextIds.join(","));
    setSearchParams(nextParams);
  };

  const rangeError =
    startDate && endDate && !isValidRange(startDate, endDate)
      ? "A data final deve ser posterior à data inicial."
      : "";

  return (
    <main className={styles.container}>
      <div className={styles.content}>
        <header className={styles.pageHeader}>
          <button
            type="button"
            className={styles.backButton}
            onClick={() => navigate("/sessions")}
            aria-label="Voltar para treinos e jogos"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
          </button>
          <div>
            <span className={styles.eyebrow}>Treinos e jogos</span>
            <h1>Comparar evolução</h1>
            <p>
              Acompanhe o desempenho dos atletas ao longo de um período.
            </p>
          </div>
        </header>

        <form className={styles.filterCard} onSubmit={handleSubmit}>
          <div className={styles.filterHeading}>
            <div>
              <h2>Período da análise</h2>
              <p>As sessões nas duas datas também entram na comparação.</p>
            </div>
            <FontAwesomeIcon icon={faCalendarDays} />
          </div>

          <div className={styles.filters}>
            <label>
              <span>Data inicial</span>
              <input
                type="date"
                value={startDate}
                max={endDate || undefined}
                onChange={(event) => setStartDate(event.target.value)}
              />
            </label>
            <label>
              <span>Data final</span>
              <input
                type="date"
                value={endDate}
                min={startDate || undefined}
                onChange={(event) => setEndDate(event.target.value)}
              />
            </label>
            <label>
              <span>Tipo de sessão</span>
              <select
                value={typeFilter}
                onChange={(event) =>
                  setTypeFilter(event.target.value as SessionTypeFilter)
                }
              >
                <option value="all">Todos</option>
                <option value={SESSION_TYPE_IDS.Treino}>Treinos</option>
                <option value={SESSION_TYPE_IDS.Jogo}>Jogos</option>
              </select>
            </label>
            <button
              type="submit"
              disabled={!isValidRange(startDate, endDate)}
            >
              <FontAwesomeIcon icon={faChartLine} />
              Comparar
            </button>
          </div>
          {rangeError && <p className={styles.formError}>{rangeError}</p>}
        </form>

        {!hasAppliedRange ? (
          <EmptyState
            title="Selecione um período"
            text="Informe duas datas diferentes para carregar a evolução dos atletas."
          />
        ) : isLoading ? (
          <EmptyState
            title="Calculando evolução..."
            text="Estamos reunindo as ações de todas as sessões do período."
          />
        ) : error ? (
          <EmptyState
            title="Não foi possível carregar a comparação"
            text="Verifique se o backend está disponível e tente novamente."
            action={
              <button
                type="button"
                className={styles.retryButton}
                onClick={() => void mutate()}
              >
                <FontAwesomeIcon icon={faRotateRight} />
                Tentar novamente
              </button>
            }
          />
        ) : !data || data.sessions.length === 0 ? (
          <EmptyState
            title="Nenhuma sessão encontrada"
            text="Altere as datas ou o tipo de sessão para ampliar a busca."
          />
        ) : data.sessions.length === 1 ? (
          <EmptyState
            title="É necessária mais uma sessão"
            text="O período selecionado contém somente uma sessão e ainda não permite medir evolução."
          />
        ) : data.athletes.length === 0 ? (
          <EmptyState
            title="Nenhum atleta com ações no período"
            text="As sessões existem, mas ainda não possuem ações individuais registradas."
          />
        ) : (
          <>
            <section className={styles.summaryCards} aria-label="Resumo do período">
              <article>
                <FontAwesomeIcon icon={faCalendarDays} />
                <div>
                  <span>Sessões analisadas</span>
                  <strong>{data.sessions.length}</strong>
                </div>
              </article>
              <article>
                <FontAwesomeIcon icon={faUsers} />
                <div>
                  <span>Atletas com dados</span>
                  <strong>{data.athletes.length}</strong>
                </div>
              </article>
              <article>
                <FontAwesomeIcon icon={faClock} />
                <div>
                  <span>Duração do período</span>
                  <strong>
                    {countPeriodDays(
                      data.period.startDate,
                      data.period.endDate,
                    )}{" "}
                    dias
                  </strong>
                </div>
              </article>
            </section>

            <section className={styles.athletesCard}>
              <div className={styles.sectionHeading}>
                <div>
                  <h2>Resumo dos atletas</h2>
                  <p>
                    Selecione de 1 a 4 atletas para comparar. A variação usa a
                    primeira e a última sessão com dados.
                  </p>
                </div>
                <div className={styles.selectionStatus}>
                  <strong>{selectedAthletes.length}/4 selecionados</strong>
                  {isValidating && <span>Atualizando...</span>}
                </div>
              </div>

              <div className={styles.desktopTable}>
                <table>
                  <thead>
                    <tr>
                      <th>Atleta</th>
                      <th>Sessões</th>
                      <th>Inicial</th>
                      <th>Final</th>
                      <th>Variação</th>
                      <th>Tendência</th>
                      <th>Comparar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.athletes.map((athlete) => {
                      const summary = getPerformanceSummary(athlete);
                      const trend = getTrend(summary.delta, "higher");
                      const trendContent = TREND_CONTENT[trend];
                      const isSelected = selectedAthleteIds.includes(athlete.id);
                      const isDisabled = !isSelected && selectionIsFull;
                      const selectAthlete = () => toggleAthlete(athlete.id);

                      return (
                        <tr
                          key={athlete.id}
                          className={`${styles.clickableRow} ${
                            isSelected ? styles.selectedRow : ""
                          } ${isDisabled ? styles.disabledRow : ""}`}
                          onClick={isDisabled ? undefined : selectAthlete}
                        >
                          <td>
                            <button
                              type="button"
                              className={styles.athleteButton}
                              onClick={(event) => {
                                event.stopPropagation();
                                selectAthlete();
                              }}
                              aria-pressed={isSelected}
                              disabled={isDisabled}
                            >
                              <strong>{athlete.name}</strong>
                              <span>{athlete.position}</span>
                            </button>
                          </td>
                          <td>{athlete.points.length}</td>
                          <td>
                            {formatMetricValue(
                              summary.first,
                              "performancePercentage",
                            )}
                          </td>
                          <td>
                            {formatMetricValue(
                              summary.last,
                              "performancePercentage",
                            )}
                          </td>
                          <td>
                            {summary.delta === null
                              ? "N/D"
                              : `${summary.delta > 0 ? "+" : ""}${summary.delta.toFixed(0)} pp`}
                          </td>
                          <td>
                            <span
                              className={`${styles.trend} ${trendContent.className}`}
                            >
                              <FontAwesomeIcon icon={trendContent.icon} />
                              {trendContent.label}
                            </span>
                          </td>
                          <td>
                            <button
                              type="button"
                              className={styles.rowArrowButton}
                              onClick={(event) => {
                                event.stopPropagation();
                                selectAthlete();
                              }}
                              aria-label={`${isSelected ? "Remover" : "Adicionar"} ${athlete.name} ${isSelected ? "da" : "à"} comparação`}
                              aria-pressed={isSelected}
                              disabled={isDisabled}
                            >
                              <FontAwesomeIcon icon={isSelected ? faCheck : faPlus} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className={styles.mobileAthletes}>
                {data.athletes.map((athlete) => {
                  const summary = getPerformanceSummary(athlete);
                  const trend = getTrend(summary.delta, "higher");
                  const trendContent = TREND_CONTENT[trend];
                  const isSelected = selectedAthleteIds.includes(athlete.id);
                  const isDisabled = !isSelected && selectionIsFull;

                  return (
                    <button
                      type="button"
                      key={athlete.id}
                      className={isSelected ? styles.selectedAthleteCard : ""}
                      onClick={() => toggleAthlete(athlete.id)}
                      aria-pressed={isSelected}
                      disabled={isDisabled}
                    >
                      <span className={styles.mobileAthleteHeading}>
                        <span>
                          <strong>{athlete.name}</strong>
                          <small>{athlete.position}</small>
                        </span>
                        <FontAwesomeIcon icon={isSelected ? faCheck : faPlus} />
                      </span>
                      <span className={styles.mobileAthleteMetrics}>
                        <span>
                          {formatMetricValue(
                            summary.first,
                            "performancePercentage",
                          )}
                          <small>Inicial</small>
                        </span>
                        <span>
                          {formatMetricValue(
                            summary.last,
                            "performancePercentage",
                          )}
                          <small>Final</small>
                        </span>
                        <span
                          className={`${styles.trend} ${trendContent.className}`}
                        >
                          <FontAwesomeIcon icon={trendContent.icon} />
                          {trendContent.label}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>

            {selectedAthletes.length > 0 && (
              <section className={styles.detailCard}>
                <div className={styles.detailHeader}>
                  <div>
                    <span className={styles.eyebrow}>Evolução comparativa</span>
                    <h2>Comparação entre atletas</h2>
                    <p>
                      Analise se os atletas estão evoluindo ou regredindo no
                      mesmo período.
                    </p>
                  </div>
                  <div className={styles.selectedAthleteLegend}>
                    {selectedAthletes.map((athlete, index) => (
                      <span key={athlete.id}>
                        <i style={{ background: PLAYER_COLORS[index] }} />
                        {athlete.name}
                      </span>
                    ))}
                  </div>
                </div>

                <ComparisonIndexCharts
                  athletes={selectedAthletes}
                  sessions={data.sessions}
                  startDate={data.period.startDate}
                  endDate={data.period.endDate}
                />
              </section>
            )}
          </>
        )}
      </div>
    </main>
  );
};

export default SessionComparison;
