import styles from "./PlayerCard.module.scss";
import type {Player} from "../../pages/CoachDashboard/index";

type PlayerCardProps = {
  player: Player;
};

const PlayerCard = ({ player }: PlayerCardProps) => {
  return (
  <div className={styles.card}>
    <div className={styles.header}>
      <h3>{player.name}</h3>
      <span>{player.position}</span>
    </div>

    <div className={styles.overall}>
      {player.overall}
    </div>
    <div className={styles.radar}>
      Click to view radar chart
    </div>

    <div className={styles.stats}>
      <div className={`${styles.stat} ${styles.off}`}>
        <span>OFF</span>
        <span>{player.offensiveActions}</span>
      </div>

      <div className={`${styles.stat} ${styles.def}`}>
        <span>DEF</span>
        <span>{player.defensiveActions}</span>
      </div> 
    </div>
  </div>
  );
};

export default PlayerCard;
