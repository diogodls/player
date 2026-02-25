import styles from "./HeaderAnalysis.module.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFloppyDisk, faRotateLeft } from "@fortawesome/free-solid-svg-icons";
import { useToast } from "../../hooks/useToast.ts";

type Props = {
  onSave?: () => void;
  onClear?: () => void; // props p adicionar lógica na pág posteriormente
};

const IndividualAnalysisHeader = ({ onSave, onClear }: Props) => {
  const toast = useToast();

  const handleSave = () => {
    try {
      if (onSave) {
        onSave();
        toast.success("Log do jogador salvo com sucesso!");
      } else {
        toast.error("Nenhuma ação de salvar foi definida.");
      }
    } catch (error) {
      toast.error("Erro ao salvar o log do jogador.");
    }
  };

  const handleClear = () => {
    try {
      if (onClear) {
        onClear();
        toast.success("Log limpo com sucesso!");
      } else {
        toast.error("Nenhuma ação de limpeza foi definida.");
      }
    } catch (error) {
      toast.error("Erro ao limpar o log.");
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>
        Análise Individual do Jogador
      </h1>

      <div className={styles.actions}>
        <button
          className={`${styles.button} ${styles.save}`}
          onClick={handleSave}
        >
          <FontAwesomeIcon icon={faFloppyDisk} />
          Salvar log do jogador
        </button>

        <button
          className={`${styles.button} ${styles.clear}`}
          onClick={handleClear}
        >
          <FontAwesomeIcon icon={faRotateLeft} />
          Limpar Log
        </button>
      </div>
    </div>
  );
};

export default IndividualAnalysisHeader;
