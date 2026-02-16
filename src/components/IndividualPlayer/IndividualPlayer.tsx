import styles from './IndividualPlayer.module.scss';
import type {Indexes, Player, Team} from "../../pages/CoachDashboard";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faArrowRightArrowLeft,
  faArrowTrendDown,
  faArrowTrendUp,
  faCircle
} from "@fortawesome/free-solid-svg-icons";
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
    breakpoint: {max: 3000, min: 1024},
    items: 1,
    slidesToSlide: 1
  },
  tablet: {
    breakpoint: {max: 1024, min: 464},
    items: 1,
    slidesToSlide: 1
  },
  mobile: {
    breakpoint: {max: 464, min: 0},
    items: 1,
    slidesToSlide: 1
  }
};

type IndividualPlayer = {
  player: Player;
  team: Team;
  metrics: string[];
};

const IndividualPlayer = ({player, team, metrics}: IndividualPlayer) => {
  //mais pra frente da pra fazer um refactor nessa parte de map dos índices, mas por enquanto vou deixar assim pra nós conseguir estruturar o resto do projeto
  return (
    <div className={styles.playerView}>
      <div className={styles.header}>
        <div className={styles.playerName}>
          <span className={styles.icon} onClick={() => console.log('volta')}>
            <FontAwesomeIcon icon={faArrowLeft}/>
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
              <div className={styles.metric} key={metric}>
                <span className={styles.name}>{metric}</span>
                <span className={styles.value}>{player[PLAYER_METRICS[metric as keyof typeof PLAYER_METRICS]]}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.playerData}>
          <div className={styles.performance}>
            <div className={styles.performanceHeader}>
              <span>Performance vs Média da equipe</span>
            </div>
            <Carousel
              showDots={true}
              responsive={responsive}
              infinite={true}
              customTransition="all .5"
              transitionDuration={500}
              containerClass="carousel-container"
              removeArrowOnDeviceType={["tablet", "mobile"]}
              deviceType={'desktop'}
              dotListClass="custom-dot-list-style"
              itemClass="carousel-item-padding-40-px"
            >
              <div className={styles.carouselItem}>
                {Object.entries(GENERAL_INDEXES).map(([key, label]) => {
                  return (
                    <CarouselItem
                      indexColor={'general'}
                      label={label}
                      indexKey={key as keyof Indexes}
                      key={key}
                      player={player}
                      team={team}
                    />
                  );
                })}
              </div>
              <div className={styles.carouselItem}>
                {Object.entries(OFFENSIVE_INDEXES).map(([key, label]) => {
                  return (
                    <CarouselItem
                      indexColor={'offensive'}
                      label={label}
                      indexKey={key as keyof Indexes}
                      key={key}
                      player={player}
                      team={team}
                    />
                  );
                })}
              </div>
              <div className={styles.carouselItem}>
                {Object.entries(DEFFENSIVE_INDEXES).map(([key, label]) => {
                  return (
                    <CarouselItem
                      indexColor={'deffensive'}
                      label={label}
                      indexKey={key as keyof Indexes}
                      key={key}
                      player={player}
                      team={team}
                    />
                  );
                })}
              </div>
            </Carousel>
          </div>

          <div className={styles.indexes}>
            <span className={styles.title}>Índices detalhados</span>

            <div className={styles.index}>
              <span className={styles.indexName} style={{color: `${INDEXES_COLORS.general}`}}>Indíces gerais</span>
              <div className={styles.values}>
                {Object.entries(GENERAL_INDEXES).map(([key, label]) => {
                  return (
                    <span className={styles.value} title={label} key={key}>
                      <span className={styles.valueName}>{label}:</span>
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
                    <span className={styles.value} key={key}>
                      <span className={styles.valueName}>{label}:</span>
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
                      <span className={styles.valueName}>{label}:</span>
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

type CarouselItem = {
  label: string,
  indexKey: keyof Indexes,
  player: Player,
  team: Team,
  indexColor: 'general' | 'offensive' | 'deffensive',
};

const CarouselItem = ({label, player, indexKey, team, indexColor}: CarouselItem) => {
  const playerScore = player.indexes[indexKey] - team.indexes[indexKey];
  const indexIcon = playerScore > 0 ? faArrowTrendUp
    : playerScore === 0 ? faArrowRightArrowLeft
      : faArrowTrendDown;
  const numberColor = playerScore > 0 ? '#86efac'
    : playerScore === 0 ? '#facc15'
      : '#dc2626';

  return (
    <span className={styles.teamIndex}>
      <span className={styles.topSide}>
        <span className={styles.name}>
          <FontAwesomeIcon icon={faCircle} style={{color: INDEXES_COLORS[indexColor]}}/>
          {label}
        </span>
        <span className={styles.icon}>
          <FontAwesomeIcon
            icon={indexIcon}
          />
        </span>
      </span>
      <span className={styles.value}>
        <span className={styles.infos}>
          {player.name}: {player.indexes[indexKey]} |
          <span> Média do time: {team.indexes[indexKey]}</span>
        </span>
        <span className={styles.number} style={{color: numberColor}}>
          {playerScore}
        </span>
      </span>
    </span>
  )
}

export default IndividualPlayer;