import type {IconDefinition} from "@fortawesome/fontawesome-svg-core";
import {faBullseye, faPeopleGroup, faShield, faFilter} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import styles from "./Filters.module.scss"
import {classNames} from "../../../utils/classNames.ts";
import Select, { Option } from 'rc-select';
import 'rc-select/assets/index.css';
import { useState } from "react";
import {PLAYERS_POSITIONS} from "../../../constants/players.ts";

type ButtonsType = {
  label : string,
  icon :  IconDefinition,
  mode : 'all phases' | 'offensive' | 'defensive'
};

const buttons: ButtonsType[] = [
  {
    label: "Todas as fases",
    icon: faPeopleGroup,
    mode:'all phases'
  },
  {
    label: "Ofensiva",
    icon: faBullseye,
    mode:'offensive'
  },
  {
    label: "Defensiva",
    icon: faShield,
    mode:'defensive'
  }
];

type Props = {
  viewMode: 'all phases' | 'offensive' | 'defensive';
  onChangeView: (mode: Props['viewMode']) => void;
};

const Filters = ({ viewMode, onChangeView }: Props) => {
  const [position, setPosition] = useState('all');

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
            onChange={(value) => setPosition(value as string)}
            className={styles.select}
            dropdownMatchSelectWidth
          >
            <Option value="all">Todas as posições</Option>
            {PLAYERS_POSITIONS.map((position) => (
              <Option value={position}>{position}</Option>
            ))}
          </Select>
        </div>

        <div className={styles.group}>
          <span className={styles.groupLabel}>Filtrar por fase</span>

          <div className={styles.button}>
            {buttons.map((button) => (
              <button
                key={button.mode}
                className={classNames([
                  styles.buttons,
                  viewMode === button.mode ? styles.active : ""
                ])}
                onClick={() => onChangeView(button.mode)}
              >
                <FontAwesomeIcon icon={button.icon} />
                <span>{button.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Filters;