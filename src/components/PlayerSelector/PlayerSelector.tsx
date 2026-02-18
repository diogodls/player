import {type Dispatch, type SetStateAction, useContext, useEffect} from "react";
import type {Player} from "../../pages/CoachDashboard";
import styles from './PlayerSelector.module.scss';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faUser} from "@fortawesome/free-solid-svg-icons";
import {PLAYERS_POSITIONS} from "../../constants/players.ts";
import {ActionsContext} from "../../contexts/ActionsContext/ActionsContext.tsx";

type PlayerSelectorProps = {
  players: Player[];
  setActionsModalOpen: Dispatch<SetStateAction<boolean>>;
};

const PlayerSelector = ({players, setActionsModalOpen}: PlayerSelectorProps) => {
  const {setSelectedPlayer, selectedPlayer} = useContext(ActionsContext);

  const handlePlayerClick = (player: Player) => {
    setSelectedPlayer(player);
    setActionsModalOpen(true);
  };

  useEffect(() => {
    console.log(selectedPlayer, players);
  }, [setSelectedPlayer, selectedPlayer]);

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
    </div>
  );
};

export default PlayerSelector;