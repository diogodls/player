import styles from "./Navbar.module.scss";
import reactLogo from '../../../assets/logoo.png'
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faChartColumn, faPeopleGroup, faUser,faHouse} from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";
import {classNames} from "../../../utils/classNames.ts";

const buttons = [
  {
    label: "Home",
    icon: faHouse,
  },
  {
    label: "Tela do treinador",
    icon: faChartColumn,
  },
  {
    label: "Análise individual",
    icon: faUser,
  },
  {
    label: "Análise de equipe",
    icon: faPeopleGroup,
  },
];

const Navbar = () => {
  const [activeIndex, setActiveIndex] = useState(4);

    return (
        <nav className={styles.navbar}>
          <img src={reactLogo}  alt={""}/>

          <div className={styles.buttons}>
            {buttons.map((btn, index) => (
              <button
                key={btn.label}
                className={
                  classNames([styles.button,
                    index === activeIndex
                      ? styles.active
                      : ''
                    ]
                  )
                }
                onClick={() => setActiveIndex(index)}
               >
                <FontAwesomeIcon icon={btn.icon} />
                <span>{btn.label}</span>
             </button>
            ))}
          </div>
        </nav>
    );
};

export default Navbar;