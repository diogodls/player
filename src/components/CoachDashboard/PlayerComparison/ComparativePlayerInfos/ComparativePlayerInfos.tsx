import styles from './ComparativePlayerInfos.module.scss';
import type {Player} from "../../../../pages/CoachDashboard";
import {PLAYER_COLORS, PLAYER_METRICS} from "../../../../constants/metrics.ts";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faStar} from "@fortawesome/free-solid-svg-icons";

type ComparativePlayerInfos = {
  selectedPlayers?: Player[];
  metrics?: string[];
};

const ComparativePlayerInfos = ({selectedPlayers, metrics}: ComparativePlayerInfos) => {
  return (
    <div className={styles.detailedInfos}>
      <h3 className={styles.title}>Comparação de atributos detalhada</h3>

      <table className={styles.table}>
        <thead>
          <tr className={styles.tableHead}>
            <th className={styles.metric}>
              Métrica
            </th>
            <th className={styles.players}>
              {selectedPlayers?.map((player, index) => (
                <span
                  className={styles.playerName}
                  key={player.id}
                  style={{color: `${PLAYER_COLORS[index]}`}}
                >
                  {player.name}
                </span>
              ))}
            </th>
          </tr>
        </thead>

        <tbody>
          {metrics?.map((metric, index) => (
            <tr className={styles.tableRow} key={index}>
              <td className={styles.metric}>
                <span className={styles.title}>{metric}</span>
              </td>
              <td className={styles.players}>
                {selectedPlayers?.map((player, index) => {
                  const maxMetric = Math.max(...selectedPlayers.map((selectedPlayer) => selectedPlayer[PLAYER_METRICS[metric as keyof typeof PLAYER_METRICS]]));
                  const betterPlayer = player[PLAYER_METRICS[metric as keyof typeof PLAYER_METRICS]] >= maxMetric;

                  return (
                    <div className={styles.data} key={player.id}>
                      <div className={styles.playerData}>
                        <span
                          className={styles.number}
                          style={{color: betterPlayer ? `${PLAYER_COLORS[index]}` : '#fff'}}
                        >
                          {player[PLAYER_METRICS[metric as keyof typeof PLAYER_METRICS]]}
                          {betterPlayer &&
                            <FontAwesomeIcon
                              className={styles.icon}
                              icon={faStar}
                              style={{color: `${PLAYER_COLORS[index]}`}}
                            />
                          }
                        </span>

                        <div className={styles.progress}>
                          <div className={styles.color} style={{
                            background: `${PLAYER_COLORS[index]}`,
                            width: `${player[PLAYER_METRICS[metric as keyof typeof PLAYER_METRICS]]}%`
                          }}/>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ComparativePlayerInfos;