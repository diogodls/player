import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate } from "react-router";
import type { PlayerViewData } from "../../pages/PlayerView";
import styles from "./IndividualPlayer.module.scss";

type IndividualPlayerProps = {
  player: PlayerViewData;
};

const IndividualPlayer = ({ player }: IndividualPlayerProps) => {
  const navigate = useNavigate();

  return (
    <div className={styles.playerView}>
      <div className={styles.header}>
        <div className={styles.playerName}>
          <button
            className={styles.icon}
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Voltar"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
          </button>
          <div className={styles.player}>
            <span className={styles.name}>{player.name}</span>
            <span>{player.position}</span>
          </div>
        </div>
      </div>

      <div className={styles.content}>
        <section className={styles.playerData}>
          <span className={styles.title}>Dados cadastrais</span>
          <div className={styles.values}>
            <span className={styles.value}>
              <span className={styles.valueName}>Idade</span>
              <span>{player.age} anos</span>
            </span>
            <span className={styles.value}>
              <span className={styles.valueName}>Posição</span>
              <span>{player.position}</span>
            </span>
            <span className={styles.value}>
              <span className={styles.valueName}>Lado preferencial</span>
              <span>{player.preferredSide}</span>
            </span>
            <span className={styles.value}>
              <span className={styles.valueName}>Equipe</span>
              <span>{player.teamName}</span>
            </span>
          </div>
        </section>

        <section className={styles.indexes}>
          <span className={styles.title}>Índices individuais</span>
          <p className={styles.emptyIndexes}>
            Nenhum índice individual disponível para este atleta.
          </p>
        </section>
      </div>
    </div>
  );
};

export default IndividualPlayer;
