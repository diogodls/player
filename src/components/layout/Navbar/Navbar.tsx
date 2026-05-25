import styles from "./Navbar.module.scss";
import reactLogo from "../../../assets/logoo.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faCalendar,
  faChartColumn,
  faHouse,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { classNames } from "../../../utils/classNames.ts";
import { useLocation, useNavigate } from "react-router";
import { useEffect, useState } from "react";

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
    link: "/sessions",
  },
];

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  return (
    <nav className={styles.navbar}>
      <img className={styles.img} src={reactLogo} alt="" />

      <div className={styles.buttons}>
        {buttons.map((btn) => {
          const isActive =
            btn.link === "/session-screen"
              ? location.pathname.startsWith("/session")
              : location.pathname === btn.link;

          return (
            <button
              key={btn.label}
              className={classNames([
                styles.button,
                isActive ? styles.active : "",
              ])}
              onClick={() => navigate(btn.link)}
            >
              <FontAwesomeIcon icon={btn.icon} />
              <span>{btn.label}</span>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        className={styles.mobileMenuButton}
        aria-label={isMobileMenuOpen ? "Fechar menu" : "Abrir menu"}
        aria-expanded={isMobileMenuOpen}
        onClick={() => setIsMobileMenuOpen((current) => !current)}
      >
        <FontAwesomeIcon icon={faBars} />
      </button>

      <div
        className={classNames([
          styles.mobileMenu,
          isMobileMenuOpen ? styles.mobileMenuOpen : "",
        ])}
      >
        <div className={styles.mobileMenuHeader}>
          <img className={styles.mobileLogo} src={reactLogo} alt="" />

          <button
            type="button"
            className={styles.mobileMenuButton}
            aria-label="Fechar menu"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        <div className={styles.mobileButtons}>
          {buttons.map((btn) => {
            const isActive =
              btn.link === "/session-screen"
                ? location.pathname.startsWith("/session")
                : location.pathname === btn.link;

            return (
              <button
                key={`mobile-${btn.label}`}
                className={classNames([
                  styles.mobileButton,
                  isActive ? styles.active : "",
                ])}
                onClick={() => {
                  navigate(btn.link);
                  setIsMobileMenuOpen(false);
                }}
              >
                <FontAwesomeIcon icon={btn.icon} />
                <span>{btn.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
