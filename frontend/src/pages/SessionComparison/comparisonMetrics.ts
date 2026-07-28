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
  mockRange?: readonly [number, number];
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
    mockRange: [0.5, 4],
  },
  goalsRelations: {
    label: "+/- gols",
    shortLabel: "+/- gols",
    group: "indexes",
    unit: "",
    decimals: 1,
    direction: "higher",
    mockRange: [-3, 8],
  },
  actionsRelations: {
    label: "+/- ações",
    shortLabel: "+/- ações",
    group: "indexes",
    unit: "",
    decimals: 1,
    direction: "higher",
    mockRange: [-8, 18],
  },
  atd: {
    label: "Ataque + transições defensivas",
    shortLabel: "ATD",
    group: "indexes",
    unit: "",
    decimals: 2,
    direction: "higher",
    mockRange: [0, 5],
  },
  dto: {
    label: "Defesa + transições ofensivas",
    shortLabel: "DTO",
    group: "indexes",
    unit: "",
    decimals: 2,
    direction: "higher",
    mockRange: [0, 5],
  },
  pgj: {
    label: "Participações em gol por jogo",
    shortLabel: "PGJ",
    group: "indexes",
    unit: "",
    decimals: 2,
    direction: "higher",
    mockRange: [0, 4],
  },
  ic: {
    label: "Índice de criação",
    shortLabel: "IC",
    group: "indexes",
    unit: "",
    decimals: 1,
    direction: "higher",
    mockRange: [15, 95],
  },
  tio: {
    label: "Taxa de influência ofensiva",
    shortLabel: "TIO",
    group: "indexes",
    unit: "%",
    decimals: 1,
    direction: "higher",
    mockRange: [10, 90],
  },
  gtj: {
    label: "Gols tomados por jogo",
    shortLabel: "GTJ",
    group: "indexes",
    unit: "",
    decimals: 2,
    direction: "lower",
    mockRange: [0, 4],
  },
  rf: {
    label: "Relação recuperação/falhas",
    shortLabel: "RF",
    group: "indexes",
    unit: "",
    decimals: 2,
    direction: "higher",
    mockRange: [0.5, 6],
  },
  tid: {
    label: "Taxa de influência defensiva",
    shortLabel: "TID",
    group: "indexes",
    unit: "%",
    decimals: 1,
    direction: "higher",
    mockRange: [10, 90],
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

export const INDEX_MOCKS_ENABLED =
  import.meta.env.VITE_ENABLE_COMPARISON_INDEX_MOCKS !== "false";

function stableHash(value: string) {
  let hash = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

export function buildMockIndexes(
  athleteId: string,
  sessionId: string,
): ComparisonIndexes {
  return Object.fromEntries(
    INDEX_METRIC_KEYS.map((metricKey) => {
      const definition = COMPARISON_METRICS[metricKey];
      const [minimum, maximum] = definition.mockRange ?? [0, 100];
      const normalized =
        stableHash(`${athleteId}:${sessionId}:${metricKey}`) / 0xffffffff;
      const value = minimum + normalized * (maximum - minimum);

      return [metricKey, Number(value.toFixed(definition.decimals))];
    }),
  ) as ComparisonIndexes;
}

export function getPointMetricValue(
  point: ComparisonPoint,
  metricKey: ComparisonMetricKey,
  athleteId: string,
  useIndexMocks = INDEX_MOCKS_ENABLED,
): { value: number | null; isMock: boolean } {
  const definition = COMPARISON_METRICS[metricKey];

  if (definition.group !== "indexes") {
    return {
      value: point.metrics[metricKey as keyof ComparisonPoint["metrics"]],
      isMock: false,
    };
  }

  if (point.indexes) {
    return {
      value: point.indexes[metricKey as keyof ComparisonIndexes],
      isMock: false,
    };
  }

  if (!useIndexMocks) return { value: null, isMock: false };

  return {
    value: buildMockIndexes(athleteId, point.sessionId)[
      metricKey as keyof ComparisonIndexes
    ],
    isMock: true,
  };
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
  athleteId: string,
  useIndexMocks = INDEX_MOCKS_ENABLED,
) {
  const values = points
    .map((point) =>
      getPointMetricValue(point, metricKey, athleteId, useIndexMocks),
    )
    .filter(
      (entry): entry is { value: number; isMock: boolean } =>
        entry.value !== null,
    );
  const first = values[0]?.value ?? null;
  const last = values.at(-1)?.value ?? null;

  return {
    first,
    last,
    delta: first === null || last === null ? null : last - first,
    hasMock: values.some((entry) => entry.isMock),
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
