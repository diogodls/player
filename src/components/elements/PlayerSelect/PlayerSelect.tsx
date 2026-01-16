import React, {type SetStateAction} from "react";
import styles from "./Select.module.scss";
import type {IndividualPlayer} from "../../../pages/CoachDashboard";
import Select, {Option} from "rc-select";
import 'rc-select/assets/index.css';

type PlayerSelect = {
  playersList: IndividualPlayer[];
  setIndividualPlayer: React.Dispatch<SetStateAction<IndividualPlayer | null>>;
}

const PlayerSelect = ({playersList, setIndividualPlayer}: PlayerSelect) => {
  const setPlayer = (setSelectedPlayer: React.Dispatch<SetStateAction<IndividualPlayer | null>>, playerId: number | null) => {
    playersList.find((player) => {
      console.log(player, playerId, player.id === playerId); // so pra ver se o lobler vai re
      return player.id === playerId
    });
    setSelectedPlayer(playersList.find((player) => player.id === playerId) ?? null);
  };

  return (
    <Select
      dropdownClassName={styles.dropdown} //TODO: terminar dropdown
      dropdownMatchSelectWidth
      placeholder={
        <span className={styles.placeholder}>Selecione um jogador</span>
      }
      className={styles.select}
      onSelect={(playerId: number | null) => setPlayer(setIndividualPlayer, playerId)}
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
  );
};

export default PlayerSelect;