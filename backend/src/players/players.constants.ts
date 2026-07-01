export const PLAYER_POSITIONS = {
  Fixo: 2,
  Ala: 3,
  Pivo: 4,
} as const;

export const PREFERRED_SIDES = {
  Destro: 1,
  Canhoto: 2,
} as const;

export const PLAYER_POSITION_IDS = Object.values(PLAYER_POSITIONS);
export const PREFERRED_SIDE_IDS = Object.values(PREFERRED_SIDES);
