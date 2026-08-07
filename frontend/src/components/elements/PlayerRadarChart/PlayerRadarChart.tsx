import { type HighlightItemData, RadarChart } from "@mui/x-charts";
import { useState } from "react";
import { PLAYER_COLORS } from "../../../constants/metrics.ts";
import type { Player } from "../../../pages/CoachDashboard";
import { classNames } from "../../../utils/classNames.ts";
import styles from "./PlayerRadarChart.module.scss";

type PlayerRadarChartProps = {
  players: Player[];
  metrics: string[];
  showButtons: boolean;
  primaryColor?: boolean;
};

type BasicMetricKey =
  "minutes" | "goals" | "goalsTaken" | "offensiveActions" | "defensiveActions";

const BASIC_METRIC_KEYS: BasicMetricKey[] = [
  "minutes",
  "goals",
  "goalsTaken",
  "offensiveActions",
  "defensiveActions",
];

function metricMaximum(players: Player[], metric: BasicMetricKey) {
  const maximum = Math.max(0, ...players.map((player) => player[metric]));
  return maximum === 0 ? 1 : maximum * 1.1;
}

function formatTooltipValue(
  value: number,
  dataIndex: number,
  metrics: string[],
) {
  const label = metrics[dataIndex] ?? "";
  const formattedValue = value.toLocaleString("pt-BR", {
    minimumFractionDigits: dataIndex === 0 ? 2 : 0,
    maximumFractionDigits: dataIndex === 0 ? 2 : 2,
  });
  return `${label}: ${formattedValue}${dataIndex === 0 ? " min" : ""}`;
}

const PlayerRadarChart = ({
  players,
  showButtons,
  metrics,
  primaryColor,
}: PlayerRadarChartProps) => {
  const [highlightedPlayer, setHighlightedPlayer] =
    useState<HighlightItemData | null>({ seriesId: players[0]?.id });

  return (
    <div
      className={styles.graph}
      style={{ background: primaryColor ? "#1F2937" : "#111827" }}
    >
      <span className={styles.title}>
        {"Gr\u00e1fico de an\u00e1lise dos jogadores"}
      </span>

      <div className={styles.graphContent}>
        {showButtons && (
          <div className={styles.graphButtons}>
            {players.map((selectedPlayer) => (
              <button
                key={selectedPlayer.id}
                className={classNames([
                  styles.graphPlayer,
                  selectedPlayer.id === highlightedPlayer?.seriesId
                    ? styles.selected
                    : "",
                ])}
                onClick={() =>
                  setHighlightedPlayer({ seriesId: selectedPlayer.id })
                }
              >
                {selectedPlayer.name}
              </button>
            ))}
          </div>
        )}

        <RadarChart
          height={300}
          highlight="series"
          highlightedItem={highlightedPlayer}
          onHighlightChange={() => {}}
          sx={{
            "& .MuiChartsLegend-series": {
              color: "#fff",
            },
            "& text": {
              fill: "#fff",
            },
          }}
          series={players.map((player, index) => ({
            id: player.id,
            label: player.name,
            data: BASIC_METRIC_KEYS.map((metric) => player[metric]),
            valueFormatter: (
              value: number,
              { dataIndex }: { dataIndex: number },
            ) => formatTooltipValue(value, dataIndex, metrics),
            fillArea: true,
            color: PLAYER_COLORS[index],
          }))}
          radar={{
            metrics: BASIC_METRIC_KEYS.map((metric, index) => ({
              name: metrics[index] ?? "",
              max: metricMaximum(players, metric),
            })),
          }}
        />
      </div>
    </div>
  );
};

export default PlayerRadarChart;
