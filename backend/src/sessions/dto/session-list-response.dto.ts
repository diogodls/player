import { SessionResponseDto } from './session-response.dto';

export class SessionListResponseDto {
  data!: SessionResponseDto[];
  total!: number;
  page!: number;
  limit!: number;
  totalPages!: number;
}
