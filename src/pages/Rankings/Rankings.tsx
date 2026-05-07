import {useMemo, useState} from "react";
import RankingSection from "../../components/elements/RankingSection/RankingSection.tsx";
import {buildRankingPlayers, rankingConfigs} from "../../constants/rankings.ts";
import {useApi} from "../../hooks/useApi.ts";
import type {CoachDashboardData} from "../CoachDashboard";
import styles from "./Rankings.module.scss";

const Rankings = () => {
  const {data, isLoading} = useApi<CoachDashboardData>("coach-dashboard");
  const [selectedRankingKey, setSelectedRankingKey] = useState("");

  const selectedRanking = useMemo(() => {
    return rankingConfigs.find((ranking) => ranking.key === selectedRankingKey);
  }, [selectedRankingKey]);

  const selectedRankingPlayers = useMemo(() => {
    if (!selectedRanking) return [];

    return buildRankingPlayers(data?.players ?? [], selectedRanking.key).filter((player) => {
      return typeof player.rankingValue === "number" && Number.isFinite(player.rankingValue);
    });
  }, [data?.players, selectedRanking]);

  return (
    <main className={styles.page}>
      <section className={styles.header}>
        <div className={styles.hero}>
          <h1>Rankings</h1>
          <p>
            Visualize os principais indices dos atletas por ranking.
          </p>
        </div>

        <div className={styles.filter}>
          <label htmlFor="ranking-filter">Ranking</label>
          <select
            id="ranking-filter"
            value={selectedRankingKey}
            onChange={(event) => setSelectedRankingKey(event.target.value)}
          >
            <option value="">Selecione um ranking</option>
            {rankingConfigs.map((ranking) => (
              <option key={ranking.key} value={ranking.key}>
                {ranking.title}
              </option>
            ))}
          </select>
        </div>
      </section>

      {isLoading ? (
        <div className={styles.feedback}>Carregando rankings...</div>
      ) : !selectedRanking ? (
        <div className={styles.emptyState}>
          Selecione um ranking no filtro para comecar a visualizar
        </div>
      ) : (
        <section className={styles.rankingContent}>
          <RankingSection
            title={selectedRanking.title}
            players={selectedRankingPlayers}
            metricKey="rankingValue"
            highlightTop3
          />
        </section>
      )}
    </main>
  );
};

export default Rankings;