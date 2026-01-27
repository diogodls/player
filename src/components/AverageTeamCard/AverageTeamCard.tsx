import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import styles from "./AverageTeamCard.module.scss"
import type {TeamCard} from "../../pages/CoachDashboard";
import {iconMap} from "../../constants/iconMap.ts";

type AverageTeamCard ={
  cards: TeamCard[]
}

const AverageTeamCard =  ({cards}: AverageTeamCard) => {
  return (
    <div className={styles.divCard}>
      {cards.map((card, index) =>   (
        <div className={styles.card}
          key={index}
          style={{background: card.color}}
        >
          <div className={styles.left}>
             <span className={styles.cardName}>{card.name}</span>
             <span className={styles.cardValue}>{card.value}</span>
          </div>
          <div className={styles.right}>
            <FontAwesomeIcon icon={iconMap[card.icon]}/>
          </div>
        </div>
      ))}
    </div>
  );
};


export default AverageTeamCard;