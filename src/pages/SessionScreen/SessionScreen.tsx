import styles from "../CoachDashboard/CoachDashboard.module.scss";
import HeaderSessionScreen from "../../components/HeaderSessionScreen/HeaderSessionScreen.tsx";
import RegistrationScreen from "../../components/RegistrationScreen/RegistrationScreen.tsx";

const SessionScreen = ()=>{
  return(
    <div className={styles.container}>
      <HeaderSessionScreen />
      <RegistrationScreen />
    </div>
  );
};

export default SessionScreen;