import {useState} from "react";
import type {Player} from "../../pages/CoachDashboard";
import styles from './PlayerSelector.module.scss';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faUser} from "@fortawesome/free-solid-svg-icons";
import {PLAYERS_POSITIONS} from "../../constants/players.ts";

type PlayerSelectorProps = {
  players: Player[];
};

const PlayerSelector = ({players}: PlayerSelectorProps) => {
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  return (
    <div className={styles.tagPlayer}>
      <div className={styles.title}>
        <span>
          <FontAwesomeIcon icon={faUser} className={styles.icon}/>
          Selecione um jogador para taggear
        </span>

        {selectedPlayer &&
          <div className={styles.selectedPlayer}>
            {selectedPlayer.name} - {selectedPlayer.position}
          </div>
        }
        <div className={styles.positions}>
          {PLAYERS_POSITIONS.map((position) => (
            <div className={styles.position} key={position}>
              <span className={styles.title}>{position}</span>

              {players.map((player: Player) => {
                if (player.position === position) return;

                return (
                  <div className={styles.player} key={player.id}>

                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PlayerSelector;