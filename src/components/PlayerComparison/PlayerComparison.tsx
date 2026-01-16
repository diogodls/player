import Select, {Option} from 'rc-select';
import React, {useState, useMemo, type SetStateAction} from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCircle, faUserGroup, faX} from "@fortawesome/free-solid-svg-icons";
import type {IndividualPlayer} from "../../pages/CoachDashboard";
import {type HighlightItemData, RadarChart} from "@mui/x-charts";
import styles from './PlayerComparison.module.scss';
import 'rc-select/assets/index.css';
import PlayerSelect from "../elements/PlayerSelect/PlayerSelect.tsx";
import ComparativePlayerInfos from "./ComparativePlayerInfos/ComparativePlayerInfos.tsx";

type PlayerComparisonProps = {
  players?: IndividualPlayer[];
  metrics?: string[];
};

const PlayerComparison = ({players, metrics}: PlayerComparisonProps) => {
  const [firstPlayer, setFirstPlayer] = useState<IndividualPlayer | null>(null);
  const [secondPlayer, setSecondPlayer] = useState<IndividualPlayer | null>(null);
  const [highlightedItem, setHighlightedItem] = useState<HighlightItemData | null>(null);
  const [selectedPlayers, setSelectedPlayers] = useState<IndividualPlayer[]>([]);

  const firstPlayerColor = "#60A5FA";
  const secondPlayerColor = "#fb923c";

  const playersList = useMemo(() => {
    return players?.filter(
      (player) =>
        player.id !== firstPlayer?.id &&
        player.id !== secondPlayer?.id
    ) ?? [];
  }, [players, firstPlayer, secondPlayer]);

  const setPlayer = (setSelectedPlayer: React.Dispatch<SetStateAction<IndividualPlayer | null>>, playerId: number) => {
    const player = playersList.find((player) => player.id === playerId) ?? null;
    if (!player) return;
    setSelectedPlayer(player);
    setSelectedPlayers((players) => [...players, player]);
  };

  return (
    <div className={styles.content}>
      <h3 className={styles.title}>
        <FontAwesomeIcon className={styles.icon} icon={faUserGroup}/>
        Comparação de atletas
      </h3>

      <div className={styles.players}>
        <div className={styles.player}>
          <span>Jogador 1</span>
          <Select
            dropdownClassName={styles.dropdown} //TODO: terminar dropdown
            dropdownMatchSelectWidth
            placeholder={
              <span className={styles.placeholder}>Selecione um jogador</span>
            }
            className={styles.select}
            onSelect={(playerId: number) => setPlayer(setFirstPlayer, playerId)}
          >
            {playersList?.map((player: IndividualPlayer) => (
              <Option
                key={player.id}
                value={player.id}
              >
                {player.name} - {player.position}
              </Option>
            ))}
          </Select>

          {firstPlayer?.id &&
            <div className={styles.selectedPlayer}>
              <div className={styles.infos}>
                <span className={styles.name}>
                  <FontAwesomeIcon icon={faCircle} style={{color: firstPlayerColor}}/>
                  {firstPlayer?.name}
                </span>

                <span className={styles.position}>{firstPlayer?.position}</span>
                <span className={styles.overall}>Média: {firstPlayer?.overall}</span>
              </div>

              <FontAwesomeIcon
                className={styles.exitIcon}
                icon={faX}
                onClick={() => setFirstPlayer(null)}
              />
            </div>
          }
        </div>

        <div className={styles.player}>
          <span>Jogador 2</span>
          <PlayerSelect playersList={playersList} setIndividualPlayer={setSecondPlayer}/>

          {secondPlayer?.id &&
            <div className={styles.selectedPlayer}>
              <div className={styles.infos}>
                <span className={styles.name}>
                  <FontAwesomeIcon icon={faCircle} style={{color: secondPlayerColor}}/>
                  {secondPlayer?.name}
                </span>

                <span className={styles.position}>{secondPlayer?.position}</span>
                <span className={styles.overall}>Média: {secondPlayer?.overall}</span>
              </div>

              <FontAwesomeIcon
                className={styles.exitIcon}
                icon={faX}
                onClick={() => setSecondPlayer(null)}
              />
            </div>
          }
        </div>
      </div>

      {(!firstPlayer?.id && !secondPlayer?.id) &&
        <div className={styles.emptyList}>
          <FontAwesomeIcon className={styles.icon} icon={faUserGroup}/>
          <span className={styles.title}>Selecione dois jogadores para comparar</span>
          <span>Escolha jogadores dos dropdowns para ver a sua comparação de performance</span>
        </div>
      }

      {(firstPlayer?.id && secondPlayer?.id) &&
        <div className={styles.graph}>
          <span className={styles.title}>Gráfico de análise dos jogadores</span>

          <div className={styles.graphButtons}>
            {selectedPlayers?.map((selectedPlayer) => (
              <button className={styles.graphPlayer}>{selectedPlayer.name}</button>
            ))}
          </div>

          <RadarChart
            height={300}
            highlight="series"
            highlightedItem={highlightedItem}
            onHighlightChange={setHighlightedItem}
            series={
              [
                {
                  label: firstPlayer?.name,
                  data: [firstPlayer.minutes, firstPlayer.goals, firstPlayer.goalsTaken, firstPlayer?.defensiveActions, firstPlayer?.offensiveActions],
                  fillArea: true
                },
                {
                  label: secondPlayer?.name,
                  data: [secondPlayer.minutes, secondPlayer.goals, secondPlayer.goalsTaken, secondPlayer?.defensiveActions, secondPlayer?.offensiveActions],
                  fillArea: true
                }
              ]
            }
            radar={{
              max: 100,
              metrics: metrics ?? [],
            }}
          />
        </div>
      }

      {(firstPlayer?.id && secondPlayer?.id) &&
        <ComparativePlayerInfos selectedPlayers={selectedPlayers} metrics={metrics}/>
      }

    </div>
  );
}

export default PlayerComparison;