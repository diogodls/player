import React, { type SetStateAction, useState } from "react";
import type { Player } from "../../../pages/CoachDashboard";
import Select from "../../../elements/Select";

type CustomSelect = {
  playersList: Player[];
  setValue: React.Dispatch<SetStateAction<Player | null>>;
};

const CustomSelect = ({ playersList, setValue }: CustomSelect) => {
  const [selectedPlayerId, setSelectedPlayerId] = useState<number | "">("");

  const setPlayer = (
    setSelectedPlayer: React.Dispatch<SetStateAction<Player | null>>,
    playerId: number | "",
  ) => {
    const selectedPlayer = playersList.find((player) => player.id === playerId) ?? null;
    setSelectedPlayerId(selectedPlayer?.id ?? "");
    setSelectedPlayer(selectedPlayer);
  };

  return (
    <Select
      name="player-select"
      placeholder="Selecione um jogador"
      value={selectedPlayerId}
      options={playersList.map((player: Player) => ({
        value: player.id,
        label: `${player.name} - ${player.position}`,
      }))}
      onChange={(playerId) => setPlayer(setValue, playerId)}
    />
  );
};

export default CustomSelect;
