import { useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faSliders, faXmark } from "@fortawesome/free-solid-svg-icons";
import { LineChart } from "@mui/x-charts";
import { INDEXES_COLORS, PLAYER_COLORS } from "../../constants/metrics";
import type { ComparisonAthlete, ComparisonIndexes, ComparisonSession } from "./index";
import {
  COMPARISON_METRICS,
  getPointMetricValue,
} from "./comparisonMetrics";
import styles from "./ComparisonIndexCharts.module.scss";

type IndexMetricKey = keyof ComparisonIndexes;
type IndexGroupKey = "general" | "offensive" | "deffensive";

const INDEX_GROUPS: Array<{
  key: IndexGroupKey;
  title: string;
  description: string;
  metrics: IndexMetricKey[];
}> = [
  {
    key: "general",
    title: "Índices gerais",
    description: "Equilíbrio global entre participação ofensiva e defensiva.",
    metrics: ["radj", "goalsRelations", "actionsRelations", "atd", "dto"],
  },
  {
    key: "offensive",
    title: "Índices ofensivos",
    description: "Criação, participação em gols e influência ofensiva.",
    metrics: ["pgj", "ic", "tio"],
  },
  {
    key: "deffensive",
    title: "Índices defensivos",
    description: "Gols tomados, recuperações e influência defensiva.",
    metrics: ["gtj", "rf", "tid"],
  },
];

const SERIES_SHAPES = [
  "circle",
  "diamond",
  "square",
  "triangle",
  "star",
] as const;

type SeriesShape = (typeof SERIES_SHAPES)[number];

function MetricSymbol({ shape }: { shape: SeriesShape }) {
  return (
    <span
      className={`${styles.metricSymbol} ${styles[`shape_${shape}`]}`}
      aria-hidden="true"
    />
  );
}

function formatDate(date: string) {
  const [year, month, day] = date.split("-");
  return year && month && day ? `${day}/${month}/${year}` : date;
}

function buildSessionLabels(sessions: ComparisonSession[]) {
  const totalByDate = new Map<string, number>();
  sessions.forEach((session) => {
    totalByDate.set(session.date, (totalByDate.get(session.date) ?? 0) + 1);
  });

  const seenByDate = new Map<string, number>();
  return sessions.map((session) => {
    const occurrence = (seenByDate.get(session.date) ?? 0) + 1;
    seenByDate.set(session.date, occurrence);
    const suffix = (totalByDate.get(session.date) ?? 0) > 1 ? ` #${occurrence}` : "";
    return `${formatDate(session.date)}${suffix} · ${session.type}`;
  });
}

function metricValues(
  athlete: ComparisonAthlete,
  metric: IndexMetricKey,
  sessions: ComparisonSession[],
) {
  const pointBySession = new Map(
    athlete.points.map((point) => [point.sessionId, point]),
  );

  return sessions.map((session) => {
    const point = pointBySession.get(session.id);
    if (!point) return null;
    return getPointMetricValue(point, metric, athlete.id).value;
  });
}

function buildScale(values: Array<number | null>) {
  const availableValues = values.filter(
    (value): value is number => value !== null,
  );
  if (availableValues.length === 0) return { min: 0, max: 10 };

  const rawMinimum = Math.min(...availableValues);
  const rawMaximum = Math.max(...availableValues);
  const range = rawMaximum - rawMinimum;
  const padding = Math.max(range * 0.1, Math.abs(rawMaximum) * 0.04, 0.5);

  return {
    min: rawMinimum >= 0 ? Math.max(0, Math.floor(rawMinimum - padding)) : Math.floor(rawMinimum - padding),
    max: Math.ceil(rawMaximum + padding),
  };
}

type MetricPickerProps = {
  group: (typeof INDEX_GROUPS)[number];
  selected: IndexMetricKey[];
  onApply: (metrics: IndexMetricKey[]) => void;
  onClose: () => void;
};

function MetricPicker({ group, selected, onApply, onClose }: MetricPickerProps) {
  const [draftSelection, setDraftSelection] = useState(selected);

  const toggleMetric = (metric: IndexMetricKey) => {
    setDraftSelection(
      draftSelection.includes(metric)
        ? draftSelection.filter((item) => item !== metric)
        : [...draftSelection, metric],
    );
  };

  return (
    <div className={styles.modalBackdrop} role="presentation" onMouseDown={onClose}>
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`metric-picker-${group.key}`}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className={styles.modalHeader}>
          <div>
            <h3 id={`metric-picker-${group.key}`}>Índices exibidos</h3>
            <p>Sem seleção, todos os índices aparecem no gráfico.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Fechar seletor de índices">
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        <div className={styles.checkboxList}>
          {group.metrics.map((metric) => (
            <label key={metric}>
              <input
                type="checkbox"
                checked={draftSelection.includes(metric)}
                onChange={() => toggleMetric(metric)}
              />
              <span className={styles.fakeCheckbox}>
                <FontAwesomeIcon icon={faCheck} />
              </span>
              <span>
                <strong>{COMPARISON_METRICS[metric].shortLabel}</strong>
                <small>{COMPARISON_METRICS[metric].label}</small>
              </span>
            </label>
          ))}
        </div>

        <div className={styles.modalFooter}>
          <button type="button" className={styles.clearButton} onClick={() => setDraftSelection([])}>
            Exibir todos
          </button>
          <button
            type="button"
            className={styles.applyButton}
            onClick={() => onApply(draftSelection)}
          >
            Aplicar
          </button>
        </div>
      </div>
    </div>
  );
}

type ComparisonIndexChartsProps = {
  athletes: ComparisonAthlete[];
  sessions: ComparisonSession[];
  startDate: string;
  endDate: string;
};

export default function ComparisonIndexCharts({
  athletes,
  sessions,
  startDate,
  endDate,
}: ComparisonIndexChartsProps) {
  const [openGroup, setOpenGroup] = useState<IndexGroupKey | null>(null);
  const [selectedMetrics, setSelectedMetrics] = useState<
    Record<IndexGroupKey, IndexMetricKey[]>
  >({ general: [], offensive: [], deffensive: [] });

  const labels = useMemo(() => buildSessionLabels(sessions), [sessions]);

  return (
    <div className={styles.root}>
      <div className={styles.chartsGrid}>
        {INDEX_GROUPS.map((group) => {
          const displayedMetrics = selectedMetrics[group.key].length
            ? selectedMetrics[group.key]
            : group.metrics;
          const chartScale = buildScale(
            athletes.flatMap((athlete) =>
              displayedMetrics.flatMap((metric) =>
                metricValues(athlete, metric, sessions),
              ),
            ),
          );
          const series = athletes.flatMap((athlete, athleteIndex) =>
            displayedMetrics.map((metric, metricIndex) => ({
              id: `${group.key}-${athlete.id}-${metric}`,
              data: metricValues(athlete, metric, sessions),
              label: `${athlete.name} · ${COMPARISON_METRICS[metric].shortLabel}`,
              color: PLAYER_COLORS[athleteIndex],
              shape: SERIES_SHAPES[metricIndex % SERIES_SHAPES.length],
              connectNulls: false,
              showMark: true,
              curve: "linear" as const,
            })),
          );

          return (
            <section
              className={styles.chartCard}
              key={group.key}
              style={{ "--group-color": INDEXES_COLORS[group.key] } as CSSProperties}
            >
              <div className={styles.chartHeader}>
                <div>
                  <span className={styles.groupMarker}>{group.title}</span>
                  <p>{group.description}</p>
                </div>
                <button
                  type="button"
                  className={styles.metricButton}
                  onClick={() => setOpenGroup(group.key)}
                  aria-label={`Selecionar ${group.title.toLowerCase()}`}
                >
                  <FontAwesomeIcon icon={faSliders} />
                  Índices
                  {selectedMetrics[group.key].length > 0 && (
                    <span>{selectedMetrics[group.key].length}</span>
                  )}
                </button>
              </div>

              <div
                className={styles.chartLegend}
                role="group"
                aria-label={`Legenda dos ${group.title.toLowerCase()}`}
              >
                <div className={styles.legendSection}>
                  <span className={styles.legendTitle}>Atletas</span>
                  <div className={styles.legendItems}>
                    {athletes.map((athlete, athleteIndex) => (
                      <span className={styles.athleteLegendItem} key={athlete.id}>
                        <i style={{ backgroundColor: PLAYER_COLORS[athleteIndex] }} />
                        {athlete.name}
                      </span>
                    ))}
                  </div>
                </div>

                <div className={styles.legendSection}>
                  <span className={styles.legendTitle}>Índices</span>
                  <div className={styles.metricLegendItems}>
                    {displayedMetrics.map((metric, metricIndex) => (
                      <span className={styles.metricLegendItem} key={metric}>
                        <MetricSymbol
                          shape={SERIES_SHAPES[metricIndex % SERIES_SHAPES.length]}
                        />
                        <span>
                          <strong>{COMPARISON_METRICS[metric].shortLabel}</strong>
                          <small>{COMPARISON_METRICS[metric].label}</small>
                        </span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className={styles.chartCanvas}>
                <LineChart
                  height={350}
                  margin={{ left: 58, right: 28, top: 20, bottom: 76 }}
                  hideLegend
                  xAxis={[{
                    scaleType: "point",
                    data: labels,
                    tickLabelStyle: {
                      angle: -24,
                      textAnchor: "end",
                      fontSize: 11,
                      fill: "#FFFFFF",
                    },
                  }]}
                  yAxis={[{
                    width: 52,
                    min: chartScale.min,
                    max: chartScale.max,
                    tickLabelStyle: { fill: "#FFFFFF" },
                  }]}
                  series={series}
                  grid={{ horizontal: true }}
                  sx={{
                    "& text, & .MuiChartsLegend-label": {
                      fill: "#FFFFFF !important",
                      color: "#FFFFFF !important",
                    },
                    "& .MuiChartsAxis-line, & .MuiChartsAxis-tick": {
                      stroke: "#FFFFFF !important",
                    },
                    "& .MuiChartsGrid-line": {
                      stroke: "rgba(255, 255, 255, 0.12)",
                    },
                  }}
                />
              </div>

              <div className={styles.chartFooter}>
                <span>{formatDate(startDate)} — {formatDate(endDate)}</span>
                <span>Lacunas indicam sessões sem ações do atleta.</span>
              </div>

              {openGroup === group.key && (
                <MetricPicker
                  group={group}
                  selected={selectedMetrics[group.key]}
                  onApply={(metrics) => {
                    setSelectedMetrics((current) => ({
                      ...current,
                      [group.key]: metrics,
                    }));
                    setOpenGroup(null);
                  }}
                  onClose={() => setOpenGroup(null)}
                />
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
