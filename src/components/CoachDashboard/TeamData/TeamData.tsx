import {useRef} from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faArrowLeft, faArrowRight} from "@fortawesome/free-solid-svg-icons";
import styles from "./TeamData.module.scss";
import TeamIndexCard from "./RelevantIndexCard/TeamIndexCard.tsx";
import type {TeamIndex} from "../../../pages/CoachDashboard";

type TeamAnalysisProps = {
  teamRelevantIndexes: TeamIndex[];
};

const TeamData = ({ teamRelevantIndexes }: TeamAnalysisProps) => {
  const carouselRef = useRef<HTMLDivElement>(null);

  const handleScroll = (direction: "left" | "right") => {
    const container = carouselRef.current;

    if (!container) {
      return;
    }

    const amount = direction === "left" ? -340 : 340;
    container.scrollBy({ left: amount, behavior: "smooth" });
  };

  if (!teamRelevantIndexes.length) {
    return (
      <section className={styles.wrapper}>
        <div className={styles.emptyState}>
          Nenhum índice disponível para a equipe.
        </div>
      </section>
    );
  }

  return (
    <section className={styles.wrapper}>
      <div className={styles.heading}>
        <div className={styles.controls}>
          <button
            type="button"
            className={styles.controlButton}
            onClick={() => handleScroll("left")}
            aria-label="Ver cards anteriores"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
          </button>
          <button
            type="button"
            className={styles.controlButton}
            onClick={() => handleScroll("right")}
            aria-label="Ver proximos cards"
          >
            <FontAwesomeIcon icon={faArrowRight} />
          </button>
        </div>
      </div>

      <div
        ref={carouselRef}
        className={styles.carousel}
      >
        {teamRelevantIndexes.map((index) => (
          <div
            key={index.id}
            className={styles.cardSlot}
          >
            <TeamIndexCard index={index} />
          </div>
        ))}
      </div>
    </section>
  );
};

export default TeamData;
