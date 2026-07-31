import styles from "./RankingSection.module.scss";
import type { RankingPlayerBase } from "../../../pages/Rankings";
type RankingSectionProps = {
  title: string;
  players: RankingPlayerBase[];
  metricLabel: string;
  limit?: number;
  highlightTop3?: boolean;
};
const podiumClassMap = [styles.top1, styles.top2, styles.top3];
const RankingSection = ({
  title,
  players,
  metricLabel,
  limit,
  highlightTop3 = true,
}: RankingSectionProps) => {
  const displayedPlayers =
    typeof limit === "number" ? players.slice(0, limit) : players;
  return (
    <section className={styles.card}>
      <div className={styles.header}>
        <div>
          <span className={styles.eyebrow}>Ranking</span>
          <h3>{title}</h3>
        </div>
        <span className={styles.total}>{displayedPlayers.length} atletas</span>
      </div>
      {displayedPlayers.length ? (
        <div className={styles.list}>
          {displayedPlayers.map((player) => {
            const highlightClass =
              highlightTop3 && player.rankingPosition <= 3
                ? podiumClassMap[player.rankingPosition - 1]
                : "";
            return (
              <article
                key={player.id}
                className={`${styles.row} ${highlightClass}`.trim()}
              >
                <div className={styles.rankBadge}>
                  <span>{player.rankingPosition}</span>
                </div>
                <div className={styles.playerInfo}>
                  <strong>{player.name}</strong>
                  <span>{player.position}</span>
                </div>
                <div className={styles.metric}>
                  <span className={styles.metricLabel}>{metricLabel}</span>
                  <strong>{player.rankingValue ?? "—"}</strong>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className={styles.emptyState}>
          Nenhum jogador disponível para este ranking.
        </div>
      )}
    </section>
  );
};
export default RankingSection;
export type { RankingSectionProps };
