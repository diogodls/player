export const SESSION_TYPES = ["Treino", "Jogo"] as const;
export const SESSION_LOCATIONS = ["Casa", "Fora"] as const;
export const SESSION_COURT_SIZES = ["Pequena", "Grande"] as const;

export const SESSION_TYPE_IDS = {
  Treino: 1,
  Jogo: 2,
} as const;

export const SESSION_LOCATION_IDS = {
  Casa: 1,
  Fora: 2,
} as const;

export const SESSION_COURT_SIZE_IDS = {
  Pequena: 1,
  Grande: 2,
} as const;
