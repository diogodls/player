export class PlayerSessionMinutesResponseDto {
  playerId!: string;
  name!: string;
  position!: string | null;
  totalSeconds!: number;
  activeSince!: Date | null;
  isActive!: boolean;
}
