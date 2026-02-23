import PlayerCard from "./PlayerCard/PlayerCard.tsx";
import styles from "./PlayersSection.module.scss";
import type {Player} from "../../../pages/CoachDashboard";

type PlayersSectionProps = {
  players: Player[];
};

const PlayersSection = ({ players }: PlayersSectionProps) => {
  if (!players.length) {
    return (
      <div className={styles.playersSection}>
        <span className={styles.emptyState}>
          Nenhum jogador disponível
        </span>
      </div>
    );
  }

  return (
    <div className={styles.playersSection}>
      {players.map((player) => (
        <PlayerCard key={player.id} player={player} />
      ))}
    </div>
  );
};

export default PlayersSection;
