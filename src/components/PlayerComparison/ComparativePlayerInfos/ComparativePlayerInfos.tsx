import styles from './ComparativePlayerInfos.module.scss';
import type {IndividualPlayer} from "../../../pages/CoachDashboard";

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
            <th>

            </th>
          </tr>
        </thead>
        <tbody>
          {metrics?.map((metric) => (
            <tr className={styles.tableRow}>
              <td className={styles.metric}>
                {metric}
                {/* TODO: descrição da métrica*/}
              </td>
              <td className={styles.players}>
                {selectedPlayers?.map((player) => (
                  <div className={styles.playerData}>
                    {/* TODO: métricas bem definidas para jogadores*/}
                    <div className={styles.progress}>
                      <div className={styles.color} style={{background: "red", width: `${player.goals}%`}}/>
                    </div>
                  </div>
                ))}
              </td>
              <td>

              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ComparativePlayerInfos;