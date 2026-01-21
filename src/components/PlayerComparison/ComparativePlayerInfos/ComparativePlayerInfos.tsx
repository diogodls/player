import styles from './ComparativePlayerInfos.module.scss';
import type {IndividualPlayer} from "../../../pages/CoachDashboard";
import {PLAYER_COLORS, PLAYER_METRICS} from "../../../constants/metrics.ts";

type ComparativePlayerInfos = {
  selectedPlayers?: IndividualPlayer[];
  metrics?: string[];
}

const ComparativePlayerInfos = ({selectedPlayers, metrics}: ComparativePlayerInfos) => {
  return (
    <div className={styles.detailedInfos}>
      <table className={styles.table}>
        <thead>
        <tr className={styles.tableHead}>
          <th className={styles.metric}>
            Métrica
          </th>
          <th className={styles.players}>
            {selectedPlayers?.map((player) => (
              <span className={styles.playerName} key={player.id}>
                  {player.name}
                </span>
            ))}
          </th>
          <th className={styles.difference}>
            Diferença
          </th>
        </tr>
        </thead>
        <tbody>
        {metrics?.map((metric, index) => (
          <tr className={styles.tableRow} key={index}>
            <td className={styles.metric}>
              {metric}
              {/* TODO: descrição da métrica*/}
              </td>
              <td className={styles.players}>
                {selectedPlayers?.map((player, index) => (
                  <div className={styles.playerData} key={player.id}>
                    <span> {player[PLAYER_METRICS[metric as keyof typeof PLAYER_METRICS]]}</span>
                    {/* TODO: métricas bem definidas para jogadores*/}
                    <div className={styles.progress}>
                      <div className={styles.color} style={{background: `${PLAYER_COLORS[index]}`, width: `${player[PLAYER_METRICS[metric as keyof typeof PLAYER_METRICS]]}%`}}/>
                    </div>
                  </div>
                ))}
              </td>
              <td className={styles.difference}>

              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ComparativePlayerInfos;