import type {IconDefinition} from "@fortawesome/fontawesome-svg-core";
import {faBullseye, faPeopleGroup, faShield, faFilter} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import styles from "./Filters.module.scss"
import {classNames} from "../../utils/classNames.ts";

type ButtonsType = {
  label : string,
  icon :  IconDefinition,
  mode : 'all phases' | 'offensive' | 'defensive'
}

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
]

type Props = {
  viewMode: 'all phases' | 'offensive' | 'defensive';
  onChangeView: (mode: Props['viewMode']) => void;
};


const Filters = ({ viewMode, onChangeView }: Props) => {
  return(
    <div className={styles.filter}>
      <div className={styles.text}>
        <FontAwesomeIcon icon={faFilter}/>
        <span> Filtros</span>
      </div>

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
  );
}

export default Filters;