import {faChartColumn} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import styles from "./AverageTeamCard.module.scss"
import type {Icon} from "@fortawesome/fontawesome-svg-core";


const cards = [
  {
    name:"Média ofensiva geral",
    color:"#2563eb",
    value:"10",
    icon: faChartColumn
  },
  {
    name:"Média defensiva geral",
    color: "#f97316",
    value: "20",
    icon: faChartColumn
  },
  {
    name:"Média defensiva geral",
    color:"#22c55e",
    value: "10",
    icon:faChartColumn
  }
]

type AverageTeamCard ={
  name: string
  color: string
  value: string
  icon: Icon
}

const AverageTeamCard =  () => {
  return (
    <div className={styles.divCard}>
      {cards.map((card, index) => (
        <div className={styles.card}
          key={index}
          style={{backgroundColor: card.color}}
        >
          <FontAwesomeIcon icon={card.icon}/>
            <span>{card.name}</span>
            <strong> {card.value}</strong>
        </div>
      ))}
    </div>
  );
};


export default AverageTeamCard;