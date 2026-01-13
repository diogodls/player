import styles from './IndividualAnalisis.module.scss';
import Select, { Option } from 'rc-select';
import {useEffect, useState, type SetStateAction} from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPeopleGroup, faPerson} from "@fortawesome/free-solid-svg-icons";
import type {IndividualPlayer} from "../../pages/CoachDashboard";
import {RadarChart} from "@mui/x-charts";

type IndividualAnalisisProps = {
  players?: IndividualPlayer[];
}

const IndividualAnalisis = ({players}: IndividualAnalisisProps) => {
  const [firstPlayer, setFirstPlayer] = useState<IndividualPlayer | null>(null);
  const [secondPlayer, setSecondPlayer] = useState<IndividualPlayer | null>(null);

  useEffect(() => {
    //TODO:filter da lista de players
  }, [firstPlayer, secondPlayer]);

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
            {players?.map((player: IndividualPlayer, index: number) => (
              <Option
                key={index}
                value={player.id}
                onChange={(player: SetStateAction<IndividualPlayer | null>) => setFirstPlayer(player)}
              >
                {player.name} - {player.position}
              </Option>
            ))}
          </Select>

          {firstPlayer?.id ??
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
            {players?.map((player: IndividualPlayer, index: number) => (
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
            {secondPlayer?.id ??
              <div className={styles.selectedPlayer}>
                <span><FontAwesomeIcon icon={faPerson}/> {secondPlayer?.name}</span>
                <span>{secondPlayer?.position}</span>
                <span>Média: {secondPlayer?.overall}</span>
              </div>
            }
          </div>
        </div>
      </div>

      <RadarChart
        height={300}
        series={[{ label: 'Lisa', data: [120, 98, 86, 99, 85, 65] }]}
        radar={{
          max: 120,
          metrics: ['Math', 'Chinese', 'English', 'Geography', 'Physics', 'History'],
        }}
      />
    </div>
  );
}

export default IndividualAnalisis;