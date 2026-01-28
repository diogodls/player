import styles from './ComparativePlayerInfos.module.scss';
import type {Player} from "../../../pages/CoachDashboard";
import {PLAYER_COLORS, PLAYER_METRICS} from "../../../constants/metrics.ts";

type ComparativePlayerInfos = {
  selectedPlayers?: Player[];
  metrics?: string[];
}

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
                <span className={styles.description}>descrição</span>
                {/* TODO: descrição da métrica*/}
              </td>
              <td className={styles.players}>
                {selectedPlayers?.map((player, index) => (
                  <div className={styles.playerData} key={player.id}>
                    <span className={styles.number}> {player[PLAYER_METRICS[metric as keyof typeof PLAYER_METRICS]]}</span>
                    {/* TODO: métricas bem definidas para jogadores*/}
                    <div className={styles.progress}>
                      <div className={styles.color} style={{
                        background: `${PLAYER_COLORS[index]}`,
                        width: `${player[PLAYER_METRICS[metric as keyof typeof PLAYER_METRICS]]}%`
                      }}/>
                    </div>
                  </div>
                ))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ComparativePlayerInfos;