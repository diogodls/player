export const PLAYER_METRICS = Object.freeze({
   "Minutagem": "minutes",
   "Gols em quadra": "defensiveActions",
   "Gols tomados em quadra": "offensiveActions",
   "Ações ofensivas": "goals",
   "Ações defensivas": "goalsTaken"
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