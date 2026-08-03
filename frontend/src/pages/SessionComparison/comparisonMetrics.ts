import type {
  ComparisonIndexes,
  ComparisonPoint,
} from "./index";

export type ComparisonMetricKey =
  | keyof ComparisonPoint["metrics"]
  | keyof ComparisonIndexes;

export type MetricDirection = "higher" | "lower" | "neutral";
export type MetricGroup = "performance" | "actions" | "indexes";

export type MetricDefinition = {
  label: string;
  shortLabel: string;
  group: MetricGroup;
  unit: string;
  decimals: number;
  direction: MetricDirection;
};

export const COMPARISON_METRICS: Record<
  ComparisonMetricKey,
  MetricDefinition
> = {
  performancePercentage: {
    label: "Performance",
    shortLabel: "Performance",
    group: "performance",
    unit: "%",
    decimals: 0,
    direction: "higher",
  },
  positiveActions: {
    label: "Ações positivas",
    shortLabel: "Positivas",
    group: "actions",
    unit: "",
    decimals: 0,
    direction: "higher",
  },
  negativeActions: {
    label: "Ações negativas",
    shortLabel: "Negativas",
    group: "actions",
    unit: "",
    decimals: 0,
    direction: "lower",
  },
  offensiveActions: {
    label: "Ações ofensivas",
    shortLabel: "Ofensivas",
    group: "actions",
    unit: "",
    decimals: 0,
    direction: "neutral",
  },
  defensiveActions: {
    label: "Ações defensivas",
    shortLabel: "Defensivas",
    group: "actions",
    unit: "",
    decimals: 0,
    direction: "neutral",
  },
  totalActions: {
    label: "Total de ações",
    shortLabel: "Total",
    group: "actions",
    unit: "",
    decimals: 0,
    direction: "neutral",
  },
  radj: {
    label: "Relação ataque-defesa por jogo",
    shortLabel: "RADJ",
    group: "indexes",
    unit: "",
    decimals: 2,
    direction: "higher",
  },
  goalsRelations: {
    label: "+/- gols",
    shortLabel: "+/- gols",
    group: "indexes",
    unit: "",
    decimals: 1,
    direction: "higher",
  },
  actionsRelations: {
    label: "+/- ações",
    shortLabel: "+/- ações",
    group: "indexes",
    unit: "",
    decimals: 1,
    direction: "higher",
  },
  atd: {
    label: "Ataque + transições defensivas",
    shortLabel: "ATD",
    group: "indexes",
    unit: "",
    decimals: 2,
    direction: "higher",
  },
  dto: {
    label: "Defesa + transições ofensivas",
    shortLabel: "DTO",
    group: "indexes",
    unit: "",
    decimals: 2,
    direction: "higher",
  },
  pgj: {
    label: "Participações em gol por jogo",
    shortLabel: "PGJ",
    group: "indexes",
    unit: "",
    decimals: 2,
    direction: "higher",
  },
  ic: {
    label: "Índice de criação",
    shortLabel: "IC",
    group: "indexes",
    unit: "",
    decimals: 1,
    direction: "higher",
  },
  tio: {
    label: "Taxa de influência ofensiva",
    shortLabel: "TIO",
    group: "indexes",
    unit: "%",
    decimals: 1,
    direction: "higher",
  },
  gtj: {
    label: "Gols tomados por jogo",
    shortLabel: "GTJ",
    group: "indexes",
    unit: "",
    decimals: 2,
    direction: "lower",
  },
  rf: {
    label: "Relação recuperação/falhas",
    shortLabel: "RF",
    group: "indexes",
    unit: "",
    decimals: 2,
    direction: "higher",
  },
  tid: {
    label: "Taxa de influência defensiva",
    shortLabel: "TID",
    group: "indexes",
    unit: "%",
    decimals: 1,
    direction: "higher",
  },
};

export const INDEX_METRIC_KEYS: Array<keyof ComparisonIndexes> = [
  "radj",
  "goalsRelations",
  "actionsRelations",
  "atd",
  "dto",
  "pgj",
  "ic",
  "tio",
  "gtj",
  "rf",
  "tid",
];

export const METRIC_GROUPS: Array<{
  label: string;
  metrics: ComparisonMetricKey[];
}> = [
  { label: "Performance", metrics: ["performancePercentage"] },
  {
    label: "Ações",
    metrics: [
      "positiveActions",
      "negativeActions",
      "offensiveActions",
      "defensiveActions",
      "totalActions",
    ],
  },
  {
    label: "Índices",
    metrics: INDEX_METRIC_KEYS,
  },
];

export function getPointMetricValue(
  point: ComparisonPoint,
  metricKey: ComparisonMetricKey,
): number {
  const definition = COMPARISON_METRICS[metricKey];

  if (definition.group !== "indexes") {
    return point.metrics[metricKey as keyof ComparisonPoint["metrics"]];
  }

  return point.indexes[metricKey as keyof ComparisonIndexes];
}

export function formatMetricValue(
  value: number | null,
  metricKey: ComparisonMetricKey,
) {
  if (value === null) return "N/D";

  const definition = COMPARISON_METRICS[metricKey];
  return `${value.toLocaleString("pt-BR", {
    minimumFractionDigits: definition.decimals,
    maximumFractionDigits: definition.decimals,
  })}${definition.unit}`;
}

export function formatMetricDelta(
  value: number | null,
  metricKey: ComparisonMetricKey,
) {
  if (value === null) return "N/D";
  if (metricKey === "performancePercentage") {
    return `${value.toLocaleString("pt-BR", {
      maximumFractionDigits: 0,
    })} pp`;
  }
  return formatMetricValue(value, metricKey);
}

export function getMetricSummary(
  points: ComparisonPoint[],
  metricKey: ComparisonMetricKey,
) {
  const values = points.map((point) => getPointMetricValue(point, metricKey));
  const first = values[0] ?? null;
  const last = values.at(-1) ?? null;

  return {
    first,
    last,
    delta: first === null || last === null ? null : last - first,
  };
}

export function getTrend(
  delta: number | null,
  direction: MetricDirection,
): "improved" | "declined" | "stable" | "changed" | "unavailable" {
  if (delta === null) return "unavailable";
  if (delta === 0) return "stable";
  if (direction === "neutral") return "changed";

  const improved =
    (direction === "higher" && delta > 0) ||
    (direction === "lower" && delta < 0);
  return improved ? "improved" : "declined";
}
