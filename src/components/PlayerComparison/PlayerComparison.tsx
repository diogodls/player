import Select, {Option} from 'rc-select';
import {useState, useMemo} from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCircle, faPlus, faUserGroup, faX} from "@fortawesome/free-solid-svg-icons";
import type {Player} from "../../pages/CoachDashboard";
import styles from './PlayerComparison.module.scss';
import ComparativePlayerInfos from "./ComparativePlayerInfos/ComparativePlayerInfos.tsx";
import {PLAYER_COLORS} from "../../constants/metrics.ts";
import PlayerRadarChart from "./PlayerRadarChart/PlayerRadarChart.tsx";
import 'rc-select/assets/index.css';

type PlayerComparisonProps = {
  players?: Player[];
  metrics?: string[];
};

const PlayerComparison = ({players, metrics}: PlayerComparisonProps) => {
  const [selectedPlayers, setSelectedPlayers] = useState<Player[]>([]);
  const [playersCount, setPlayersCount] = useState<number>(2); //TODO: opção de adicionar mais players fica pra depois

  const playersList = useMemo(() => {
    return players?.filter(
      (player) =>
        !selectedPlayers.find((selectedPlayer) => player?.id === selectedPlayer?.id)
    ) ?? [];
  }, [players, selectedPlayers]);
  // de todas as gambiarras que eu ja fiz, essa com certeza é uma das que eu mais não quero lembrar

  const setPlayer = (playerId: number, index: number) => {
    const player = playersList.find((player) => player.id === playerId) ?? null;
    if (!player) return;
    let newSelectedPlayersList = [...selectedPlayers];
    newSelectedPlayersList[index] = player;
    setSelectedPlayers(newSelectedPlayersList);
  };

  const removePlayer = (playerId: number) => {
    setSelectedPlayers(
      (players) => players.filter((selectedPlayer) => selectedPlayer.id !== playerId)
    );

    setPlayersCount(playersCount <= 2 ? playersCount : playersCount - 1);
  };

  return (
    <div className={styles.content}>
      <h3 className={styles.title}>
        <span>
          <FontAwesomeIcon className={styles.icon} icon={faUserGroup}/>
          Comparação de atletas
        </span>

        {playersCount < 4 &&
          <button
            className={styles.addPlayer}
            onClick={() => setPlayersCount(playersCount + 1)}
          >
            <FontAwesomeIcon icon={faPlus}/>
          </button>
        }
      </h3>

      <div className={styles.players}>
        {Array.from({length: playersCount}).map((_position, index) => (
          <div className={styles.player}>
            <span>Jogador {index + 1}</span>
            <Select
              dropdownClassName={styles.dropdown}
              dropdownMatchSelectWidth
              placeholder={
                <span className={styles.placeholder}>Selecione um jogador</span>
              }
              className={styles.select}
              onSelect={(playerId: number) => setPlayer(playerId, index)}
            >
              {playersList?.map((player: Player) => (
                <Option
                  key={player.id}
                  value={player.id}
                >
                  {player.name} - {player.position}
                </Option>
              ))}
            </Select>

            {selectedPlayers[index] &&
              <div className={styles.selectedPlayer}>
                <div className={styles.infos}>
                  <span className={styles.name}>
                    <FontAwesomeIcon icon={faCircle} style={{color: PLAYER_COLORS[index]}}/>
                    {selectedPlayers[index]?.name}
                  </span>

                  <span className={styles.position}>{selectedPlayers[index]?.position}</span>
                  <span className={styles.overall}>Média: {selectedPlayers[index]?.overall}</span>
                </div>

                <FontAwesomeIcon
                  className={styles.exitIcon}
                  icon={faX}
                  onClick={() => removePlayer(selectedPlayers[index].id)}
                />
              </div>
            }
          </div>
        ))}
      </div>

      {
        selectedPlayers.filter(Boolean).length < 2 &&
          <div className={styles.emptyList}>
            <FontAwesomeIcon className={styles.icon} icon={faUserGroup}/>
            <span className={styles.title}>Selecione dois ou mais jogadores para comparar</span>
            <span>Escolha jogadores dos dropdowns para ver a sua comparação de performance</span>
          </div>
      }

      {
        selectedPlayers.filter(Boolean).length > 1 &&
          <>
            <PlayerRadarChart players={selectedPlayers} metrics={metrics ?? []}/>
            <ComparativePlayerInfos selectedPlayers={selectedPlayers} metrics={metrics}/>
          </>
      }
    </div>
  );
};

export default PlayerComparison;