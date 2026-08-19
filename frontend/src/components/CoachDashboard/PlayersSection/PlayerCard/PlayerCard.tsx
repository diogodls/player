import styles from "./PlayerCard.module.scss";
import type { Player } from "../../../../pages/CoachDashboard";
import { Link } from "react-router";

type PlayerCardProps = {
  player: Player;
};

const PlayerCard = ({ player }: PlayerCardProps) => {
  const formattedRating =
    player.rating == null
      ? "—"
      : player.rating.toLocaleString("pt-BR", {
          minimumFractionDigits: 1,
          maximumFractionDigits: 1,
        });
  return (
    <Link to={`/player/${player.id}`} className={styles.card}>
      <div className={styles.header}>
        <h3>{player.name}</h3>
        <span>{player.position}</span>
      </div>

      <div className={styles.overall}>
        {player.overall ?? "Nenhum dado registrado"}
      </div>
      <div className={styles.radar}>Click to view radar chart</div>

      <div className={styles.stats}>
        <div className={styles.rating}>
          <span>NOTA MÉDIA</span>
          <strong>{formattedRating}</strong>
        </div>
      </div>
    </Link>
  );
};

export default PlayerCard;
