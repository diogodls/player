import {useMemo, useState} from "react";
import RankingSection from "../../components/elements/RankingSection/RankingSection.tsx";
import {buildRankingPlayers, rankingConfigs} from "../../constants/rankings.ts";
import {useApi} from "../../hooks/useApi.ts";
import type {CoachDashboardData} from "../CoachDashboard";
import sessionActionStyles from "../../components/SessionDetails/SessionActions/SessionActions.module.scss";
import styles from "./Rankings.module.scss";
import Select from "../../components/elements/Select/Select.tsx";

const Rankings = () => {
  const {data, isLoading} = useApi<CoachDashboardData>("coach-dashboard");
  const [selectedRankingKey, setSelectedRankingKey] = useState("");

  const selectedRanking = useMemo(() => {
    return rankingConfigs.find((ranking) => ranking.key === selectedRankingKey);
  }, [selectedRankingKey]);

  const selectedRankingPlayers = useMemo(() => {
    if (!selectedRanking) return [];

    return buildRankingPlayers(data?.players ?? [], selectedRanking.key).filter((player) => {
      return Number.isFinite(player.rankingValue);
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

         <label className={`${sessionActionStyles.filterField} ${styles.filter}`} htmlFor="ranking-filter">
           <span className={sessionActionStyles.filterLabel}>Ranking</span>
           <Select
             id="ranking-filter"
             value={selectedRankingKey}
             onChange={(value) => setSelectedRankingKey(value || "")}
             options={[
               ...rankingConfigs.map((item) => ({
                 value: item.key,
                 label: item.title,
              })),
             ]}
           />
         </label>
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
