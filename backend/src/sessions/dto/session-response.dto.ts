export class SessionResponseDto {
  id!: string;
  typeId!: number;
  type!: string;
  locationId!: number;
  local!: string;
  courtSizeId!: number;
  courtSize!: string;
  date!: string;
  description!: string | null;
  opponent?: string | null;
  teamName!: string;
}
