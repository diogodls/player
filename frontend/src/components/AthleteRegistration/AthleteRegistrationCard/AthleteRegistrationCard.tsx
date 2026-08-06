import type { MouseEvent } from "react";
import styles from "./AthleteRegistrationCard.module.scss";
import {useNavigate} from "react-router";
import {classNames} from "../../../utils/classNames.ts";

type AthleteRegistrationCardProps = {
  athlete: {
    id: string;
    name: string;
    age: number;
    position: string;
  };
  onEdit: (event: MouseEvent<HTMLButtonElement>) => void;
  onDelete: (event: MouseEvent<HTMLButtonElement>) => void;
};

const AthleteRegistrationCard = ({
  athlete,
  onEdit,
  onDelete,
}: AthleteRegistrationCardProps) => {
  const navigate = useNavigate();

  return (
    <article className={classNames([styles.card, styles.interactive])}>
      <button
        className={styles.primaryAction}
        type="button"
        onClick={() => navigate(`/player/${athlete.id}`)}
        aria-label={`Ver detalhes de ${athlete.name}`}
      >
        <span className={styles.topRow}>
          <span className={styles.position}>{athlete.position}</span>
          <span className={styles.age}>{athlete.age} anos</span>
        </span>
        <span className={styles.body}>
          <span className={styles.name}>{athlete.name}</span>
        </span>
      </button>

      <div className={styles.actions}>
        <button className={styles.secondaryAction} type="button" onClick={onEdit} aria-label={`Editar ${athlete.name}`}>
          Editar
        </button>
        <button className={styles.dangerAction} type="button" onClick={onDelete} aria-label={`Excluir ${athlete.name}`}>
          Excluir
        </button>
      </div>
    </article>
  );
};

export default AthleteRegistrationCard;
