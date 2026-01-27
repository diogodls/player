import styles from "./CoachDashboard.module.scss";
import {useApi} from "../../hooks/useApi.ts";
import type {CoachDashboardData} from "./index";
import AverageTeamCard from "../../components/AverageTeamCard/AverageTeamCard.tsx";
import HeaderDashboard from  "../../components/HeaderDashboard/HeaderDashboard.tsx";
import {useState} from "react";
import PlayersSection from "../../components/PlayersSection/PlayersSection.tsx";
import Filters from "../../components/Filters/Filters.tsx";

type ViewMode = 'team' | 'individual' | 'compare';
type FilterMode = 'all phases' | 'offensive' | 'defensive';


const CoachDashboard = () => {
  const { data } = useApi<CoachDashboardData>("coach-dashboard");
  const [viewMode, setViewMode] = useState<ViewMode>('team');
  const [filterMode, setFilterMode] = useState<FilterMode>('all phases');



  return (
    <div className={styles.container}>
      <AverageTeamCard cards={data?.averageTeamCards ?? []}/>

      <PlayersSection players = {data?.players ?? []} />

      <HeaderDashboard
        viewMode={viewMode}
        onChangeView={setViewMode}
      />
      {/*{viewMode === 'team' && <TeamAnalysis />}*/}
      {viewMode === 'individual' && (<Filters
        viewMode={filterMode}
        onChangeView={setFilterMode}
      />)}
      {/*{viewMode === 'compare' && <CompareAnalysis />}*/}

      {/*{filterMode === 'all phases' && <All Phases />}*/}
      {/*{filterMode === 'offensive' && <offensive />}*/}
      {/*{filterMode === 'defensive' && <defensive />}*/}
    </div>
  );
};
export default CoachDashboard;