import {faCodeCompare, faPeopleGroup, faUser, faFileExport} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import styles from "./HeaderDashboard.module.scss"
import { useState } from "react";
import {useNavigate} from "react-router";
import {classNames} from "../../utils/classNames.ts";

const buttons= [
  {
    label: "Análise da Equipe",
    icon: faPeopleGroup,
    link:''
  },
  {
    label: "Análise Individual",
    icon: faUser,
    link:''
  },
  {
    label: "Compare",
    icon: faCodeCompare,
    link:''
  }
]

const HeaderDashboard = () => {

  const [activeIndex, setActiveIndex] = useState(0);
  const navigate = useNavigate();

  const buttonAction = (index:number, link: string) => {
    setActiveIndex(index);
    navigate(link);
  };

  return(
    <div className={styles.div}>
      <div>
        <span className={styles.text}>Dashboard de Performance da Equipe</span>
        <span> Analise as métricas de performance dos atletas</span>
      </div>
      <div className={styles.buttonsFlex}>
        <div className={styles.button}>
          {buttons.map((button, index) => (
            <button
              key={button.label}
              className={classNames([
                styles.buttons,
                index === activeIndex
                  ? button.label === "Compare"
                    ? styles.activePurple
                    : styles.active
                  : ""
              ])}
              onClick={() => buttonAction(index, button.link)}
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
}

export default HeaderDashboard;