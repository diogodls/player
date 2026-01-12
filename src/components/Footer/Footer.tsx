import styles from "./Footer.module.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChartColumn } from "@fortawesome/free-solid-svg-icons";

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.left}>
        <FontAwesomeIcon icon={faChartColumn} />
        <div className={styles.text}>
          <strong>Plataforma de análise de desempenho</strong>
          <span>
            © PLAYER. Análise de desempenho individual de atletas profissionais.
          </span>
        </div>
      </div>

      <div className={styles.right}>
        <span>Feito na</span>
        <div className={styles.badge}>UFSM</div>
      </div>
    </footer>
  );
};

export default Footer;
