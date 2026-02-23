import {faCodeCompare, faPeopleGroup, faUser, faFileExport} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import styles from "./HeaderDashboard.module.scss"
import {classNames} from "../../../utils/classNames.ts";
import type {IconDefinition} from "@fortawesome/fontawesome-svg-core";

type ButtonsType = {
  label: string,
  icon: IconDefinition,
  mode: 'team' | 'individual' | 'compare'
};

const buttons: ButtonsType[] = [
  {
    label: "Análise da Equipe",
    icon: faPeopleGroup,
    mode:'team'
  },
  {
    label: "Análise Individual",
    icon: faUser,
    mode:'individual'
  },
  {
    label: "Compare",
    icon: faCodeCompare,
    mode:'compare'
  }
];

type Props = {
  viewMode: 'team' | 'individual' | 'compare';
  onChangeView: (mode: Props['viewMode']) => void;
};

const HeaderDashboard = ({ viewMode, onChangeView}: Props) => {
  return (
    <div className={styles.div}>
      <div>
        <span className={styles.text}>Dashboard de Performance da Equipe</span>
        <span>Analise as métricas de performance dos atletas</span>
      </div>

      <div className={styles.buttonsFlex}>
        <div className={styles.button}>
          {buttons.map((button) => (
            <button
              key={button.mode}
              className={classNames([
                styles.buttons,
                viewMode === button.mode
                  ? button.mode === 'compare'
                    ? styles.activePurple
                    : styles.active
                  : ""
              ])}
              onClick={() => onChangeView(button.mode)}
            >
              <FontAwesomeIcon icon={button.icon} />
              <span>{button.label}</span>
            </button>
          ))}
        </div>
        <div>
          <button className={styles.export}>
            <FontAwesomeIcon icon={faFileExport}/>
            <span>Exportar Data</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default HeaderDashboard;