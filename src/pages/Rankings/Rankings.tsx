import RankingSection from "../../components/elements/RankingSection/RankingSection.tsx";
import {buildRankingPlayers, rankingConfigs} from "../../constants/rankings.ts";
import {useApi} from "../../hooks/useApi.ts";
import type {CoachDashboardData} from "../CoachDashboard";
import styles from "./Rankings.module.scss";

const Rankings = () => {
  const {data, isLoading} = useApi<CoachDashboardData>("coach-dashboard");

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <span className={styles.eyebrow}>Dashboard de desempenho</span>
        <h1>Rankings</h1>
        <p>
          Visualize os principais índices dos atletas em uma grade de rankings.
        </p>
      </section>

      {isLoading ? (
        <div className={styles.feedback}>Carregando rankings...</div>
      ) : (
        <section className={styles.grid}>
          {rankingConfigs.map((ranking) => (
            <RankingSection
              key={ranking.title}
              title={ranking.title}
              players={buildRankingPlayers(data?.players ?? [], ranking.key)}
              metricKey="rankingValue"
              limit={5}
              highlightTop3
            />
          ))}
        </section>
      )}
    </main>
  );
};

export default Rankings;
