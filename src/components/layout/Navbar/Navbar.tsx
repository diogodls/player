import styles from "./Navbar.module.scss";
import reactLogo from '../../../assets/logoo.png'
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faChartColumn, faPeopleGroup, faUser, faHouse, faCalendar} from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";
import {classNames} from "../../../utils/classNames.ts";
import {useNavigate} from "react-router";

const buttons = [
  {
    label: "Home",
    icon: faHouse,
    link: '/',
  },
  {
    label: "Tela do treinador",
    icon: faChartColumn,
    link: '/coach-dashboard',
  },
  {
    label: "Treinos e jogos",
    icon: faCalendar,
    link: '/session-screen',
  },
  {
    label: "Análise individual",
    icon: faUser,
    link:'/individual-analysis',
  },
  {
    label: "Análise de equipe",
    icon: faPeopleGroup,
    link:'analise-equipe',
  },
]

const Navbar = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const navigate = useNavigate();

  const buttonAction = (index:number, link:string ) => {
    setActiveIndex(index);
    navigate(link);
  };

  return (
        <nav className={styles.navbar}>
          <img className={styles.img} src={reactLogo}  alt={""}/>

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
                onClick={() => buttonAction(index, btn.link)}
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