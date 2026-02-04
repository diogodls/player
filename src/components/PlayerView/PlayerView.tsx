import styles from './PlayerView.module.scss';
import type {Player, Team} from "../../pages/CoachDashboard";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faArrowLeft, faCircle} from "@fortawesome/free-solid-svg-icons";
import PlayerRadarChart from "../PlayerRadarChart/PlayerRadarChart.tsx";
import {METRICS_COLORS, METRICS_TYPES, PLAYER_METRICS} from "../../constants/metrics.ts";

type PlayerView = {
  player: Player;
  team: Team;
  metrics: string[];
};

const PlayerView = ({player, team, metrics}: PlayerView) => {
  return (
    <div className={styles.playerView}>
      <div className={styles.header}>
        <div className={styles.playerName}>
          <span className={styles.icon} onClick={() => console.log('volta')}>
            <FontAwesomeIcon icon={faArrowLeft} />
          </span>
          <div className={styles.player}>
            <span className={styles.player}>{player.name}</span>
            <span>{player.position}</span>
          </div>
        </div>
        <div className={styles.overall}>
          <span>Overall Rating</span>
          <span className={styles.rating}>{player.overall}</span>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.radarGraph}>
          <PlayerRadarChart players={[player]} showButtons={false} metrics={metrics ?? []} />

          <div className={styles.metrics}>
            {metrics.map(metric => (
              <div className={styles.metric}>
                <span className={styles.name}>{metric}</span>
                <span className={styles.value}>{player[PLAYER_METRICS[metric as keyof typeof PLAYER_METRICS]]}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.playerData}>
          <div className={styles.performance}>
            <div>
              <span>Performance vs Média da equipe</span>
            </div>
            <div>
              {Object.entries(METRICS_TYPES).map(([label, key], index) => (
                <div className={styles.metric} key={index}>
                  <span>
                    <FontAwesomeIcon icon={faCircle} color={METRICS_COLORS[index]} />
                    {label}
                  </span>
                  <span>
                    Player: {key} | Team: {key}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className={styles.statistics}>
            <span></span>
            exibir índices
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerView;