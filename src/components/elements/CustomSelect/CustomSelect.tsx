import React, { type SetStateAction } from "react";
import styles from "./CustomSelect.module.scss";
import type { Player } from "../../../pages/CoachDashboard";
import Select, { Option } from "rc-select";
import "rc-select/assets/index.css";

type CustomSelect = {
  playersList: Player[];
  setValue: React.Dispatch<SetStateAction<Player | null>>;
};

// TODO: corrigir componente em outra task
const CustomSelect = ({ playersList, setValue }: CustomSelect) => {
  const setPlayer = (
    setSelectedPlayer: React.Dispatch<SetStateAction<Player | null>>,
    playerId: number | null
  ) => {
    playersList.find((player) => {
      return player.id === playerId;
    });
    setSelectedPlayer(playersList.find((player) => player.id === playerId) ?? null);
  };

  return (
    <div className={styles.customSelect}>
      <Select
        dropdownClassName={styles.customSelectDropdown} //TODO: terminar dropdown
        dropdownMatchSelectWidth
        placeholder={<span className={styles.placeholder}>Selecione um jogador</span>}
        className={styles.select}
        onSelect={(playerId: number | null) => setPlayer(setValue, playerId)}
      >
        {playersList?.map((player: Player) => (
          <Option key={player.id} value={player.id}>
            {player.name} - {player.position}
          </Option>
        ))}
      </Select>
    </div>
  );
};

export default CustomSelect;
