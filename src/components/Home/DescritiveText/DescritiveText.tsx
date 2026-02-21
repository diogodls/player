import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faChartColumn} from "@fortawesome/free-solid-svg-icons";
import {classNames} from "../../../utils/classNames.ts";
import styles from './DescritiveText.module.scss';
import {useNavigate} from "react-router";

const DescritiveText = () => {
  const navigate = useNavigate();
  return (
    <div className={styles.content}>
      <div className={styles.texts}>
        <span className={styles.icon}><FontAwesomeIcon icon={faChartColumn}/></span>
        <span>
          <h1 className={styles.title}>Plataforma de análise de</h1>
          <h1 className={styles.secondaryTitle}>Performance esportiva</h1>
        </span>

        <span className={styles.informativeText}>Software de análise esportiva, feito para técnicos e analistas capturarem dados sobre seus atletas.</span>
      </div>

      <div className={styles.linkButtons}>
        <button
          className={classNames([styles.button, styles.actionButton])}
          onClick={() => navigate('/coach')}
          >
          Tela do treinador
        </button>
        <button
          className={styles.button}
          onClick={() => navigate('/analise')}
        >
          Começar análise
        </button>
      </div>
    </div>
  );
};

export default DescritiveText;