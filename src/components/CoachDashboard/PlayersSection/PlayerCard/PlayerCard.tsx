import styles from "./PlayerCard.module.scss";
import type {Player} from "../../../../pages/CoachDashboard";
import {Link} from "react-router";
import type { KeyboardEvent, MouseEvent, ReactNode } from "react";

type PlayerCardProps = {
  player: Omit<Pick<Player, "id" | "name" | "position">, "id"> &
    { id: string | number } &
    Partial<Pick<Player, "overall" | "offensiveActions" | "defensiveActions">>;
  to?: string;
  children?: ReactNode;
  onClick?: (event: MouseEvent<HTMLElement>) => void;
  onKeyDown?: (event: KeyboardEvent<HTMLElement>) => void;
  size?: "default" | "compact";
  disabled?: boolean;
};

const PlayerCardContent = ({ player, children }: PlayerCardProps) => {
  if (children) {
    return (
      <>
        <div className={styles.header}>
          <h3>{player.name}</h3>
          <span>{player.position}</span>
        </div>

        {children}
      </>
    );
  }

  return (
    <>
      <div className={styles.header}>
        <h3>{player.name}</h3>
        <span>{player.position}</span>
      </div>

      <div className={styles.overall}>
        {player.overall}
      </div>
      <div className={styles.radar}>
        Click to view radar chart
      </div>

      <div className={styles.stats}>
        <div className={`${styles.stat} ${styles.off}`}>
          <span>OFF</span>
          <span>{player.offensiveActions}</span>
        </div>

        <div className={`${styles.stat} ${styles.def}`}>
          <span>DEF</span>
          <span>{player.defensiveActions}</span>
        </div>
      </div>
    </>
  );
};

const PlayerCard = ({
  player,
  to = `/player/${player.id}`,
  children,
  onClick,
  onKeyDown,
  size = "default",
  disabled = false,
}: PlayerCardProps) => {
  const cardClassName = [
    styles.card,
    size === "compact" ? styles.compact : "",
    disabled ? styles.disabled : "",
  ].filter(Boolean).join(" ");

  if (disabled) {
    return (
      <article className={cardClassName}>
        <PlayerCardContent player={player}>
          {children}
        </PlayerCardContent>
      </article>
    );
  }

  if (onClick || onKeyDown) {
    return (
      <article
        className={cardClassName}
        role="button"
        tabIndex={0}
        onClick={onClick}
        onKeyDown={onKeyDown}
      >
        <PlayerCardContent player={player}>
          {children}
        </PlayerCardContent>
      </article>
    );
  }

  return (
    <Link to={to} className={cardClassName}>
      <PlayerCardContent player={player}>
        {children}
      </PlayerCardContent>
    </Link>
  );
};

export default PlayerCard;
