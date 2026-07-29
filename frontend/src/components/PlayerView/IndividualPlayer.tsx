import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate } from "react-router";
import { INDEXES_LABELS, INDEXES_META } from "../../constants/metrics.ts";
import type { PlayerIndexes, PlayerViewData } from "../../pages/PlayerView";
import styles from "./IndividualPlayer.module.scss";

type IndividualPlayerProps = {
  player: PlayerViewData;
};

const indexEntries = Object.entries(INDEXES_META) as Array<
  [keyof PlayerIndexes, (typeof INDEXES_META)[keyof typeof INDEXES_META]]
>;

const formatIndex = (value: number | null) =>
  value === null || !Number.isFinite(value)
    ? "-"
    : new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 }).format(value);

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
          {player.indexes ? (
            <div className={styles.indexGroups}>
              {Object.entries(INDEXES_LABELS).map(([category, label]) => (
                <div className={styles.indexGroup} key={category}>
                  <span className={styles.indexName}>{label}</span>
                  <div className={styles.values}>
                    {indexEntries
                      .filter(([, meta]) => meta.category === category)
                      .map(([key, meta]) => (
                        <span className={styles.value} key={key} title={meta.label}>
                          <span className={styles.valueName}>{meta.label}</span>
                          <span className={styles.number}>
                            {formatIndex(player.indexes?.[key] ?? null)}
                          </span>
                        </span>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className={styles.emptyIndexes}>
              Nenhum índice individual disponível para este atleta.
            </p>
          )}
        </section>
      </div>
    </div>
  );
};

export default IndividualPlayer;
