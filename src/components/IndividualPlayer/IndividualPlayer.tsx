import styles from './IndividualPlayer.module.scss';
import type {Indexes, Player, Team} from "../../pages/CoachDashboard";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faArrowLeft} from "@fortawesome/free-solid-svg-icons";
import PlayerRadarChart from "../PlayerRadarChart/PlayerRadarChart.tsx";
import {
  DEFFENSIVE_INDEXES,
  GENERAL_INDEXES, INDEXES_COLORS,
  OFFENSIVE_INDEXES,
  PLAYER_METRICS
} from "../../constants/metrics.ts";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";

const responsive = {
  desktop: {
    breakpoint: { max: 3000, min: 1024 },
    items: 3,
    slidesToSlide: 3
  },
  tablet: {
    breakpoint: { max: 1024, min: 464 },
    items: 2,
    slidesToSlide: 2
  },
  mobile: {
    breakpoint: { max: 464, min: 0 },
    items: 1,
    slidesToSlide: 1
  }
};

type IndividualPlayer = {
  player: Player;
  team: Team;
  metrics: string[];
};

const PlayerView = ({player, team, metrics}: IndividualPlayer) => {

  return (
    <div className={styles.playerView}>
      <div className={styles.header}>
        <div className={styles.playerName}>
          <span className={styles.icon} onClick={() => console.log('volta')}>
            <FontAwesomeIcon icon={faArrowLeft} />
          </span>
          <div className={styles.player}>
            <span className={styles.name}>{player.name}</span>
            <span>{player.position}</span>
          </div>
        </div>
        <div className={styles.overall}>
          <span>Overall Rating</span>
          <span className={styles.rating}>{player.overall}</span>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.radarGraph}>
          <PlayerRadarChart players={[player]} showButtons={false} metrics={metrics ?? []} primaryColor/>

          <div className={styles.metrics}>
            {metrics.map(metric => (
              <div className={styles.metric}>
                <span className={styles.name}>{metric}</span>
                <span className={styles.value}>{player[PLAYER_METRICS[metric as keyof typeof PLAYER_METRICS]]}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.playerData}>
          <div className={styles.performance}>
            <div>
              <span>Performance vs Média da equipe</span>
            </div>
            <div className={styles.carousel}>
              <Carousel
                swipeable={false}
                showDots={true}
                responsive={responsive}
                infinite={true}
                keyBoardControl={true}
                customTransition="all .5"
                transitionDuration={500}
                containerClass="carousel-container"
                removeArrowOnDeviceType={["tablet", "mobile"]}
                deviceType={'desktop'}
                dotListClass="custom-dot-list-style"
                itemClass="carousel-item-padding-40-px"
              >
                <div>Item 1</div>
                <div>Item 2</div>
                <div>Item 3</div>
                <div>Item 4</div>
              </Carousel>
            </div>
          </div>

          <div className={styles.indexes}>
            <span className={styles.title}>Índices detalhados</span>

            <div className={styles.index}>
              <span className={styles.indexName} style={{color: `${INDEXES_COLORS.general}`}}>Indíces gerais</span>
              <div className={styles.values}>
                {Object.entries(GENERAL_INDEXES).map(([key, label]) => {
                  return (
                    <span className={styles.value} title={label} key={key}>
                      {key}:
                      <span className={styles.number}>{player.indexes[key as keyof Indexes]}</span>
                    </span>
                  );
                })}
              </div>
            </div>
            <div className={styles.index}>
              <span className={styles.indexName} style={{color: `${INDEXES_COLORS.offensive}`}}>Indíces Ofensivos</span>
              <div className={styles.values}>
                {Object.entries(OFFENSIVE_INDEXES).map(([key, label]) => {
                  return (
                    <span className={styles.value} title={label} key={key}>
                      {key}:
                      <span className={styles.number}>{player.indexes[key as keyof Indexes]}</span>
                    </span>
                  );
                })}
              </div>
            </div>
            <div className={styles.index}>
              <span className={styles.indexName} style={{color: `${INDEXES_COLORS.deffensive}`}}>Indíces Defensivos</span>
              <div className={styles.values}>
                {Object.entries(DEFFENSIVE_INDEXES).map(([key, label]) => {
                  return (
                    <span className={styles.value} title={label} key={key}>
                      {key}:
                      <span className={styles.number}>{player.indexes[key as keyof Indexes]}</span>
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerView;