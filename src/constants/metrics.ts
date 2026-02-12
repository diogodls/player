export const PLAYER_METRICS = Object.freeze({
   "Minutagem": "minutes",
   "Gols em quadra": "defensiveActions",
   "Gols tomados em quadra": "offensiveActions",
   "Ações ofensivas": "goals",
   "Ações defensivas": "goalsTaken",
});

export const PLAYER_COLORS = Object.freeze([
   "#60A5FA", "#fb923c", "#FA4F58", "#22BF75"
]);

export const METRICS_TYPES = Object.freeze({
   "Ofensivo em quadra": ['goals'],
   "Defensivo em quadra": ['goalsTaken'],
   "Ações Ofensivas": ['defensiveActions'],
   "Ações Defensivas": ['offensiveActions'],
});

export const INDEXES_COLORS = Object.freeze({
   offensive: '#FB923C',
   deffensive: '#60A5FA',
   general: '#F9CB15',
});

export const GENERAL_INDEXES = Object.freeze({
   radj: 'Relação Ataque-Defesa por jogo',
   goalsRelations: '+/- gols',
   actionsRelations: '+/- ações',
   atd: 'Relação ataque + transições defensivas',
   dto: 'Relação defesa + transições ofensivas',
});

export const OFFENSIVE_INDEXES = {
   pgj: 'Participações em gol por jogo',
   ic: 'Indíce de criação',
   tio: 'Taxa de influência ofensiva',
};

export const DEFFENSIVE_INDEXES = {
   gtj: 'Gols tomados por jogo',
   rf: 'Relação recuperação/falhas defensivas',
   tid: 'Taxa de influência defensiva',
};