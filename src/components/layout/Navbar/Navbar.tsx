import styles from "./Navbar.module.scss";
import reactLogo from '../../../assets/react.svg'
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faChartLine, faPeopleGroup, faUser,faHouse} from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";


const Navbar = () => {
  const [active, setActive] = useState(false);

    return (
        <nav className={styles.navbar}>
          <img src={reactLogo}  alt={""}/>

          <div className={styles.buttons}>
            <button
              className={active ? styles.active : styles.button}
              onClick={() => setActive(!active)}
            >
              <FontAwesomeIcon icon={faHouse}/>
              <span>Home</span>
            </button>


            <button className={styles.button}>
              <FontAwesomeIcon icon={faChartLine}/>
              <span>Tela do treinador</span>
            </button>

            <button className={styles.button}>
              <FontAwesomeIcon icon={faUser}/>
              <span>Analise individual</span>
            </button>

            <button className={styles.button}>
              <FontAwesomeIcon icon={faPeopleGroup}/>
              <span>Análise de equipe</span>
            </button>
          </div>
        </nav>
    );
};

export default Navbar;