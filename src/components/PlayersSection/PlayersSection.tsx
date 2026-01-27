import styles from "./PlayersSection.module.scss";

type PlayersSectionProps = {
    children: React.ReactNode;
};

const PlayersSection = ({ children }: PlayersSectionProps) => {
    return (
        <div className={styles.playersSection}>
            {children}
        </div>
    );
};

export default PlayersSection;
