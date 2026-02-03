import {type HighlightItemData, RadarChart} from "@mui/x-charts";
import {PLAYER_COLORS} from "../../constants/metrics.ts";
import {useState} from "react";
import type {Player} from "../../pages/CoachDashboard";
import styles from "./PlayerRadarChart.module.scss";
import {classNames} from "../../utils/classNames.ts";

type PlayerRadarChart = {
  players: Player[];
  metrics: string[];
  showButtons: boolean;
};

const PlayerRadarChart = ({players, showButtons, metrics}: PlayerRadarChart) => {
  const [highlightedPlayer, setHighlightedPlayer] = useState<HighlightItemData | null>({seriesId: players[0]?.id});

  return (
    <div className={styles.graph}>
      <span className={styles.title}>Gráfico de análise dos jogadores</span>

      <div className={styles.graphContent}>
        {showButtons &&
          <div className={styles.graphButtons}>
            {players?.map((selectedPlayer) => (
              <button
                key={selectedPlayer.id}
                className={classNames([
                  styles.graphPlayer,
                  selectedPlayer.id === highlightedPlayer?.seriesId
                    ? styles.selected
                    : '',
                ])}
                onClick={() => setHighlightedPlayer({seriesId: selectedPlayer.id})}
              >
                {selectedPlayer.name}
              </button>
            ))}
          </div>
        }

        <RadarChart
          height={300}
          highlight="series"
          highlightedItem={highlightedPlayer}
          onHighlightChange={() => {
          }}
          sx={{
            '& .MuiChartsLegend-series': {
              color: '#fff',
            },
            '& text': {
              fill: '#fff',
            },
          }}
          series={
            players.map((player, index) => {
              return {
                id: player.id,
                label: player?.name,
                data: [player.minutes, player.goals, player.goalsTaken, player?.defensiveActions, player?.offensiveActions],
                fillArea: true,
                color: PLAYER_COLORS[index],
              }
            })
          }
          radar={{
            max: 100,
            metrics: metrics ?? [],
          }}
        />
      </div>
    </div>
  );
};

export default PlayerRadarChart;