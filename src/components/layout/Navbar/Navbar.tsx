import styles from "./Navbar.module.scss";
import reactLogo from "../../../assets/logoo.png";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCalendar, faChartColumn, faHouse} from "@fortawesome/free-solid-svg-icons";
import {classNames} from "../../../utils/classNames.ts";
import {useLocation, useNavigate} from "react-router";

const buttons = [
  {
    label: "Home",
    icon: faHouse,
    link: "/",
  },
  {
    label: "Tela do treinador",
    icon: faChartColumn,
    link: "/coach-dashboard",
  },
  {
    label: "Treinos e jogos",
    icon: faCalendar,
    link: "/session-screen",
  },
];

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isSessionsRoute = location.pathname === "/session-screen" || location.pathname.startsWith("/sessions/");

  return (
    <nav className={styles.navbar}>
      <img className={styles.img} src={reactLogo} alt="" />

      <div className={styles.buttons}>
        {buttons.map((btn) => (
          <button
            key={btn.label}
            className={classNames([
              styles.button,
              btn.link === "/session-screen"
                ? isSessionsRoute
                  ? styles.active
                  : ""
                : location.pathname === btn.link
                  ? styles.active
                  : "",
            ])}
            onClick={() => navigate(btn.link)}
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
