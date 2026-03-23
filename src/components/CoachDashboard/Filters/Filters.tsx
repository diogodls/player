import { faFilter } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Select, { Option } from "rc-select";
import "rc-select/assets/index.css";
import styles from "./Filters.module.scss";
import { PLAYERS_POSITIONS } from "../../../constants/players.ts";

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
        <div className={styles.group}>
          <span className={styles.groupLabel}>Filtrar por posição</span>
          <Select
            value={position}
            onChange={(value) => onChangePosition(value as PositionFilter)}
            className={styles.select}
            dropdownMatchSelectWidth
          >
            <Option value="all">Todas as posições</Option>
            {PLAYERS_POSITIONS.map((playerPosition) => (
              <Option key={playerPosition} value={playerPosition}>
                {playerPosition}
              </Option>
            ))}
          </Select>
        </div>
      </div>
    </div>
  );
};

export default Filters;

