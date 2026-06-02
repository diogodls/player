import type {Dispatch, SetStateAction} from "react";
import { faFilter } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { PLAYERS_POSITIONS } from "../../../constants/players.ts";
import styles from "./PlayersFilter.module.scss";
import Select from "../../elements/Select/Select.tsx";

type PositionFilter = "all" | (typeof PLAYERS_POSITIONS)[number];

type Props = {
  position: PositionFilter;
  onChangePosition: (position: PositionFilter) => void;
  nameFilter: string;
  onNameChange: Dispatch<SetStateAction<string>>;
};

const PlayersFilter = ({ position, onChangePosition, onNameChange, nameFilter }: Props) => {

  return (
    <div className={styles.filter}>
      <div className={styles.header}>
        <FontAwesomeIcon className={styles.icon} icon={faFilter} />
        <span>Filtros</span>
      </div>

      <div className={styles.content}>
        <label className={styles.filterGroup} htmlFor="athlete-name-filter">
          <span className={styles.filterLabel}>Nome</span>
          <input
            id="athlete-name-filter"
            className={styles.input}
            type="search"
            value={nameFilter}
            placeholder="Buscar atleta"
            onChange={(event) => {
              onNameChange(event.target.value);
            }}
          />
        </label>

        <Select<PositionFilter>
          label="Filtrar por posição"
          name="position-filter"
          value={position}
          options={[
            { value: "all", label: "Todas as posições" },
            ...PLAYERS_POSITIONS.map((playerPosition) => ({
              value: playerPosition,
              label: playerPosition,
            })),
          ]}
          onChange={(value) => {
            if (value) onChangePosition(value);
          }}
        />
      </div>
    </div>
  );
};

export default PlayersFilter;
