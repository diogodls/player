export class PlayerIndexesResponseDto {
  radj!: number | null;
  goalsRelations!: number | null;
  actionsRelations!: number | null;
  atd!: number | null;
  dto!: number | null;
  pgj!: number | null;
  ic!: number | null;
  tio!: number | null;
  gtj!: number | null;
  rf!: number | null;
  tid!: number | null;
}

export class PlayerResponseDto {
  id!: string;
  name!: string;
  age!: number;
  positionId!: number;
  position!: string;
  preferredSideId!: number;
  preferredSide!: string;
  teamName!: string;
  indexes!: PlayerIndexesResponseDto | null;
}
