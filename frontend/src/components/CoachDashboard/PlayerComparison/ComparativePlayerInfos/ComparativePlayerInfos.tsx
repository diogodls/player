import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import type { Player } from "../../../../pages/CoachDashboard";
import { PLAYER_COLORS } from "../../../../constants/metrics.ts";
import {
  COMPARISON_METRICS,
  formatMetricValue,
} from "../../../../pages/SessionComparison/comparisonMetrics.ts";
import styles from "./ComparativePlayerInfos.module.scss";

type ComparativePlayerInfosProps = {
  selectedPlayers?: Player[];
};

type PlayerIndexKey = keyof Player["indexes"];

const INDEX_KEYS: PlayerIndexKey[] = [
  "pgj",
  "ic",
  "gtj",
  "rf",
  "radj",
  "goalsRelations",
  "actionsRelations",
  "atd",
  "dto",
  "tio",
  "tid",
];

function normalizedBarWidth(
  value: number,
  values: number[],
  direction: "higher" | "lower" | "neutral",
) {
  const minimum = Math.min(...values);
  const maximum = Math.max(...values);
  if (maximum === minimum) return 100;
  const normalized = ((value - minimum) / (maximum - minimum)) * 100;
  return direction === "lower" ? 100 - normalized : normalized;
}

const ComparativePlayerInfos = ({
  selectedPlayers = [],
}: ComparativePlayerInfosProps) => {
  return (
    <div className={styles.detailedInfos}>
      <h3 className={styles.title}>Comparação de atributos detalhada</h3>

      <table className={styles.table}>
        <thead>
          <tr className={styles.tableHead}>
            <th className={styles.metric}>Métrica</th>
            <th className={styles.players}>
              {selectedPlayers.map((player, index) => (
                <span
                  className={styles.playerName}
                  key={player.id}
                  style={{ color: PLAYER_COLORS[index] }}
                >
                  {player.name}
                </span>
              ))}
            </th>
          </tr>
        </thead>

        <tbody>
          {INDEX_KEYS.map((indexKey) => {
            const definition = COMPARISON_METRICS[indexKey];
            const values = selectedPlayers.map(
              (player) => player.indexes[indexKey],
            );
            const bestValue =
              definition.direction === "lower"
                ? Math.min(...values)
                : Math.max(...values);

            return (
              <tr className={styles.tableRow} key={indexKey}>
                <td className={styles.metric}>
                  <span className={styles.title}>{definition.shortLabel}</span>
                </td>
                <td className={styles.players}>
                  {selectedPlayers.map((player, playerIndex) => {
                    const value = player.indexes[indexKey];
                    const betterPlayer = value === bestValue;

                    return (
                      <div className={styles.data} key={player.id}>
                        <div className={styles.playerData}>
                          <span
                            className={styles.number}
                            style={{
                              color: betterPlayer
                                ? PLAYER_COLORS[playerIndex]
                                : "#fff",
                            }}
                          >
                            {formatMetricValue(value, indexKey)}
                            {betterPlayer && (
                              <FontAwesomeIcon
                                className={styles.icon}
                                icon={faStar}
                                style={{ color: PLAYER_COLORS[playerIndex] }}
                              />
                            )}
                          </span>

                          <div className={styles.progress}>
                            <div
                              className={styles.color}
                              style={{
                                background: PLAYER_COLORS[playerIndex],
                                width: `${normalizedBarWidth(
                                  value,
                                  values,
                                  definition.direction,
                                )}%`,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ComparativePlayerInfos;
