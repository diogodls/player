import styles from './PlayerView.module.scss';
import type {Player, Team} from "../../pages/CoachDashboard";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faArrowLeft} from "@fortawesome/free-solid-svg-icons";

type PlayerView = {
  player: Player;
  team: Team;
};

const PlayerView = ({player}: PlayerView) => {
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
        <div className={styles.radarGraph}></div>

        <div className={styles.playerData}>
          <div className={styles.performance}></div>
          <div className={styles.statistics}></div>
        </div>
      </div>
    </div>
  );
};

export default PlayerView;