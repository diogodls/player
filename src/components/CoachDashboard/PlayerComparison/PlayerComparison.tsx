import { useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircle, faPlus, faUserGroup, faX } from "@fortawesome/free-solid-svg-icons";
import type { Player } from "../../../pages/CoachDashboard";
import Select from "../../../elements/Select";
import ComparativePlayerInfos from "./ComparativePlayerInfos/ComparativePlayerInfos.tsx";
import { PLAYER_COLORS } from "../../../constants/metrics.ts";
import PlayerRadarChart from "../../elements/PlayerRadarChart/PlayerRadarChart.tsx";
import styles from "./PlayerComparison.module.scss";

type PlayerComparisonProps = {
  players?: Player[];
  metrics?: string[];
};

const PlayerComparison = ({ players, metrics }: PlayerComparisonProps) => {
  const [selectedPlayers, setSelectedPlayers] = useState<Player[]>([]);
  const [playersCount, setPlayersCount] = useState<number>(2);

  const playersList = useMemo(() => {
    return players?.filter(
      (player) =>
        !selectedPlayers.find((selectedPlayer) => player?.id === selectedPlayer?.id)
    ) ?? [];
  }, [players, selectedPlayers]);

  const setPlayer = (playerId: number, index: number) => {
    const player = playersList.find((player) => player.id === playerId) ?? selectedPlayers[index] ?? null;
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
          <FontAwesomeIcon className={styles.icon} icon={faUserGroup} />
          Comparação de atletas
        </span>

        {playersCount < 4 &&
          <button
            className={styles.addPlayer}
            onClick={() => setPlayersCount(playersCount + 1)}
          >
            <FontAwesomeIcon icon={faPlus} />
          </button>
        }
      </h3>

      <div className={styles.players}>
        {Array.from({ length: playersCount }).map((_position, index) => {
          const selectedPlayer = selectedPlayers[index];
          const currentOptions = selectedPlayer ? [selectedPlayer, ...playersList] : playersList;

          return (
            <div className={styles.player} key={index}>
              <Select
                label={`Jogador ${index + 1}`}
                name={`comparison-player-${index}`}
                placeholder="Selecione um jogador"
                value={selectedPlayer?.id ?? ""}
                options={currentOptions.map((player) => ({
                  value: player.id,
                  label: `${player.name} - ${player.position}`,
                }))}
                onChange={(playerId) => {
                  if (playerId !== "") setPlayer(playerId, index);
                }}
              />

              {selectedPlayer &&
                <div className={styles.selectedPlayer}>
                  <div className={styles.infos}>
                    <span className={styles.name}>
                      <FontAwesomeIcon icon={faCircle} style={{ color: PLAYER_COLORS[index] }} />
                      {selectedPlayer.name}
                    </span>

                    <span className={styles.position}>{selectedPlayer.position}</span>
                    <span className={styles.overall}>Média: {selectedPlayer.overall}</span>
                  </div>

                  <FontAwesomeIcon
                    className={styles.exitIcon}
                    icon={faX}
                    onClick={() => removePlayer(selectedPlayer.id)}
                  />
                </div>
              }
            </div>
          );
        })}
      </div>

      {selectedPlayers.filter(Boolean).length < 2 &&
        <div className={styles.emptyList}>
          <FontAwesomeIcon className={styles.icon} icon={faUserGroup} />
          <span className={styles.title}>Selecione dois ou mais jogadores para comparar</span>
          <span>Escolha jogadores dos dropdowns para ver a sua comparação de performance</span>
        </div>
      }

      {selectedPlayers.filter(Boolean).length > 1 &&
        <div>
          <PlayerRadarChart players={selectedPlayers} showButtons metrics={metrics ?? []} />
          <ComparativePlayerInfos selectedPlayers={selectedPlayers} metrics={metrics} />
        </div>
      }
    </div>
  );
};

export default PlayerComparison;
