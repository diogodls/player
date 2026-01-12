import {faChartColumn} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import styles from "./AverageTeamCard.module.scss"
import type {Icon} from "@fortawesome/fontawesome-svg-core";


const cards = [
  {
    name:"Média Ofensiva Geral",
    color:"linear-gradient(135deg, #2563eb, #1e40af)",
    value:"10.2",
    icon: faChartColumn
  },
  {
    name:"Média Defensiva Geral",
    color: "linear-gradient(135deg, #f97316, #c2410c)",
    value: "20.5",
    icon: faChartColumn
  },
  {
    name:"Média Geral da Equipe",
    color:"linear-gradient(135deg, #22c55e, #15803d)",
    value: "10.3",
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
          style={{background: card.color}}
        >
          <div className={styles.left}>
             <span className={styles.cardName}>{card.name}</span>
             <span className={styles.cardValue}>{card.value}</span>
          </div>
          <div className={styles.right}>
            <FontAwesomeIcon icon={card.icon}/>
          </div>
        </div>
      ))}
    </div>
  );
};


export default AverageTeamCard;