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
  const [openActionsModal, setOpenActionsModal] = useState<boolean>(false);

  const handlePlayerClick = (player: Player) => {
    setSelectedPlayer(player);
    setOpenActionsModal(true);
  };

  return (
    <div className={styles.tagPlayer}>
      <span className={styles.title}>
        <FontAwesomeIcon icon={faUser} className={styles.icon}/>
        Selecione um jogador para taggear
      </span>

      {selectedPlayer &&
        <div className={styles.selectedPlayer}>
          <span className={styles.playerData}><span className={styles.playerName}>{selectedPlayer.name}</span> - {selectedPlayer.position}</span>
          <span className={styles.description}>Jogador selecionado - Clique para taggear ações</span>
        </div>
      }
      <div className={styles.positions}>
        {PLAYERS_POSITIONS.map((position) => (
          <div className={styles.position} key={position}>
            <span className={styles.title}>{position}</span>

            {players.map((player: Player) => {
              if (player.position !== position) return;

              return (
                <button
                  key={player.id}
                  className={`${styles.player} ${selectedPlayer?.id === player.id ? styles.selected : ''}`}
                  onClick={() => handlePlayerClick(player)}
                >
                  <span className={styles.name}>{player.name}</span>
                  <span className={styles.description}>Clique para marcar uma ação</span>
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {openActionsModal && <div></div>}
    </div>
  );
};

export default PlayerSelector;