import styles from "./CoachDashboard.module.scss";
import {useApi} from "../../hooks/useApi.ts";
import type {CoachDashboardData} from "./index";
import AverageTeamCard from "../../components/AverageTeamCard/AverageTeamCard.tsx";
import HeaderDashboard from  "../../components/HeaderDashboard/HeaderDashboard.tsx";
import {useState} from "react";

type ViewMode = 'team' | 'individual' | 'compare';

const CoachDashboard = () => {
  const { data } = useApi<CoachDashboardData>("coach-dashboard");
  const [viewMode, setViewMode] = useState<ViewMode>('team');

  return (
    <div className={styles.container}>
      <AverageTeamCard cards={data?.averageTeamCards ?? []}/>
      <HeaderDashboard
        viewMode={viewMode}
        onChangeView={setViewMode}
      />
      {/*{viewMode === 'team' && <TeamAnalysis />}*/}
      {/*{viewMode === 'individual' && <IndividualAnalysis />}*/}
      {/*{viewMode === 'compare' && <CompareAnalysis />}*/}
    </div>
  );
}
export default CoachDashboard;