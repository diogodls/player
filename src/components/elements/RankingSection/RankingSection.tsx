import {useMemo} from "react";
import styles from "./RankingSection.module.scss";
import type {NumericKeys, RankingPlayerBase} from "../../../types/ranking.ts";

type RankingSectionProps<T extends RankingPlayerBase> = {
  title: string;
  players: T[];
  metricKey: NumericKeys<T>;
  limit?: number;
  highlightTop3?: boolean;
};

const podiumClassMap = [styles.top1, styles.top2, styles.top3];

const formatMetricLabel = (metricKey: string) => metricKey
  .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
  .replace(/^\w/, (character) => character.toUpperCase());

const RankingSection = <T extends RankingPlayerBase>({
  title,
  players,
  metricKey,
  limit,
  highlightTop3 = true,
}: RankingSectionProps<T>) => {
  const rankedPlayers = useMemo(() => {
    const sortedPlayers = [...players].sort((currentPlayer, nextPlayer) => {
      const currentValue = currentPlayer[metricKey] as number;
      const nextValue = nextPlayer[metricKey] as number;

      return nextValue - currentValue;
    });

    return typeof limit === "number"
      ? sortedPlayers.slice(0, limit)
      : sortedPlayers;
  }, [limit, metricKey, players]);

  return (
    <section className={styles.card}>
      <div className={styles.header}>
        <div>
          <span className={styles.eyebrow}>Ranking</span>
          <h3>{title}</h3>
        </div>

        <span className={styles.total}>{rankedPlayers.length} atletas</span>
      </div>

      {rankedPlayers.length ? (
        <div className={styles.list}>
          {rankedPlayers.map((player, index) => {
            const position = index + 1;
            const metricValue = player[metricKey] as number;
            const highlightClass = highlightTop3 && index < 3
              ? podiumClassMap[index]
              : "";

            return (
              <article
                key={player.id ?? `${player.name}-${position}`}
                className={`${styles.row} ${highlightClass}`.trim()}
              >
                <div className={styles.rankBadge}>
                  <span>{position}</span>
                </div>

                <div className={styles.playerInfo}>
                  <strong>{player.name}</strong>
                  <span>{player.position}</span>
                </div>

                <div className={styles.metric}>
                  <span className={styles.metricLabel}>{formatMetricLabel(String(metricKey))}</span>
                  <strong>{metricValue}</strong>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className={styles.emptyState}>
          Nenhum atleta disponível para este ranking.
        </div>
      )}
    </section>
  );
};

export default RankingSection;
export type {RankingSectionProps};
