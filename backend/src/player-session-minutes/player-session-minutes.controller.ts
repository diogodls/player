import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
} from '@nestjs/common';
import { UpdatePlayerSessionMinutesDto } from './dto/update-player-session-minutes.dto';
import { PlayerSessionMinutesService } from './player-session-minutes.service';

@Controller('sessions/:sessionId/minutes')
export class PlayerSessionMinutesController {
  constructor(private readonly minutesService: PlayerSessionMinutesService) {}

  @Get()
  findAll(@Param('sessionId', new ParseUUIDPipe()) sessionId: string) {
    return this.minutesService.findAll(sessionId);
  }

  @Put(':playerId')
  update(
    @Param('sessionId', new ParseUUIDPipe()) sessionId: string,
    @Param('playerId', new ParseUUIDPipe()) playerId: string,
    @Body() dto: UpdatePlayerSessionMinutesDto,
  ) {
    return this.minutesService.update(sessionId, playerId, dto);
  }

  @Post(':playerId/start')
  start(
    @Param('sessionId', new ParseUUIDPipe()) sessionId: string,
    @Param('playerId', new ParseUUIDPipe()) playerId: string,
  ) {
    return this.minutesService.start(sessionId, playerId);
  }

  @Post(':playerId/stop')
  stop(
    @Param('sessionId', new ParseUUIDPipe()) sessionId: string,
    @Param('playerId', new ParseUUIDPipe()) playerId: string,
  ) {
    return this.minutesService.stop(sessionId, playerId);
  }
}
