import styles from "../CoachDashboard/CoachDashboard.module.scss";
import HeaderSessionScreen from "../../components/HeaderSessionScreen/HeaderSessionScreen.tsx";

const SessionScreen = ()=>{
  return(
    <div className={styles.container}>
      <HeaderSessionScreen/>
    </div>
  );
};

export default SessionScreen;