import Select, { Option } from 'rc-select';
import {useState, type SetStateAction, useMemo} from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPeopleGroup, faPerson} from "@fortawesome/free-solid-svg-icons";
import type {IndividualPlayer} from "../../pages/CoachDashboard";
import {RadarChart} from "@mui/x-charts";
import styles from './PlayerComparison.module.scss';

type PlayerComparisonProps = {
  players?: IndividualPlayer[];
  metrics?: string[];
}

const PlayerComparison = ({players, metrics}: PlayerComparisonProps) => {
  const [firstPlayer, setFirstPlayer] = useState<IndividualPlayer | null>(null);
  const [secondPlayer, setSecondPlayer] = useState<IndividualPlayer | null>(null);

  const playersList = useMemo(() => {
    return players?.filter(
      (player) =>
        player.id !== firstPlayer?.id &&
        player.id !== secondPlayer?.id
    ) ?? [];
  }, [players, firstPlayer, secondPlayer]);

  return (
    <div>
      <h1 className={styles.title}>
        <FontAwesomeIcon icon={faPeopleGroup}/>
        Comparação de atletas
      </h1>

      <div className={styles.players}>
        <div className={styles.player}>
          <span>Jogador 1</span>
          <Select>
            {playersList?.map((player: IndividualPlayer, index: number) => (
              <Option
                key={index}
                value={player.id}
                onChange={(player: SetStateAction<IndividualPlayer | null>) => setFirstPlayer(player)}
              >
                {player.name} - {player.position}
              </Option>
            ))}
          </Select>

          {firstPlayer?.id &&
            <div className={styles.selectedPlayer}>
              <span><FontAwesomeIcon icon={faPerson}/> {firstPlayer?.name}</span>
              <span>{firstPlayer?.position}</span>
              <span>Média: {firstPlayer?.overall}</span>
            </div>
          }
        </div>

        <div className={styles.player}>
          <span>Jogador 2</span>
          <Select>
            {playersList?.map((player: IndividualPlayer, index: number) => (
              <Option
                key={index}
                value={player.id}
                onChange={(player: IndividualPlayer | null) => setSecondPlayer(player)}
              >
                {player.name} - {player.position}
              </Option>
            ))}
          </Select>
          <div className={styles.selectedPlayer}>
            {secondPlayer?.id &&
              <div className={styles.selectedPlayer}>
                <span><FontAwesomeIcon icon={faPerson}/> {secondPlayer?.name}</span>
                <span>{secondPlayer?.position}</span>
                <span>Média: {secondPlayer?.overall}</span>
              </div>
            }
          </div>
        </div>
      </div>

      {(firstPlayer?.atk && secondPlayer?.id) &&
        <RadarChart
          height={300}
          series={
            [
              { label: firstPlayer?.name, data: [firstPlayer.atk, firstPlayer.twk, firstPlayer.def, firstPlayer?.passe, firstPlayer?.speed] },
              { label: secondPlayer?.name, data: [secondPlayer.atk, secondPlayer.twk, secondPlayer.def, secondPlayer?.passe, secondPlayer?.speed] }
            ]
          }
          radar={{
            max: 100,
            metrics: metrics ?? [],
          }}
        />
      }
    </div>
  );
}

export default PlayerComparison;