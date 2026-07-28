export const SESSION_TYPES = {
  Treino: 1,
  Jogo: 2,
} as const;

export const SESSION_LOCATIONS = {
  Casa: 1,
  Fora: 2,
} as const;

export const SESSION_COURT_SIZES = {
  Pequena: 1,
  Grande: 2,
} as const;

export const SESSION_TYPE_IDS = Object.values(SESSION_TYPES);
export const SESSION_LOCATION_IDS = Object.values(SESSION_LOCATIONS);
export const SESSION_COURT_SIZE_IDS = Object.values(SESSION_COURT_SIZES);
