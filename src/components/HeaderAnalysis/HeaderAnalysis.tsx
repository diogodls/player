import styles from "./HeaderAnalysis.module.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFloppyDisk, faRotateLeft } from "@fortawesome/free-solid-svg-icons";

type Props = {
  onSave?: () => void;
  onClear?: () => void;
};

const IndividualAnalysisHeader = ({ onSave, onClear }: Props) => {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>
        Análise Individual do Jogador
      </h1>

      <div className={styles.actions}>
        <button
          className={`${styles.button} ${styles.save}`}
          onClick={onSave}
        >
          <FontAwesomeIcon icon={faFloppyDisk} />
          Salvar log do jogador
        </button>

        <button
          className={`${styles.button} ${styles.clear}`}
          onClick={onClear}
        >
          <FontAwesomeIcon icon={faRotateLeft} />
          Limpar Log
        </button>
      </div>
    </div>
  );
};

export default IndividualAnalysisHeader;
