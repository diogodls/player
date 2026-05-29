import { faFilter } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { PLAYERS_POSITIONS } from "../../../constants/players.ts";
import styles from "./Filters.module.scss";
import Select from "../../elements/Select/Select.tsx";

type PositionFilter = "all" | (typeof PLAYERS_POSITIONS)[number];

type Props = {
  position: PositionFilter;
  onChangePosition: (position: PositionFilter) => void;
};

const Filters = ({ position, onChangePosition }: Props) => {
  return (
    <div className={styles.filter}>
      <div className={styles.header}>
        <FontAwesomeIcon className={styles.icon} icon={faFilter} />
        <span>Filtros</span>
      </div>

      <div className={styles.content}>
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

export default Filters;
