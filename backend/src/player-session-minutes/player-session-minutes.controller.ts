import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { UpdatePlayerSessionMinutesDto } from './dto/update-player-session-minutes.dto';
import { PlayerSessionMinutesService } from './player-session-minutes.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthenticatedUser } from '../auth/authenticated-user.interface';

@UseGuards(JwtAuthGuard)
@Controller('sessions/:sessionId/minutes')
export class PlayerSessionMinutesController {
  constructor(private readonly minutesService: PlayerSessionMinutesService) {}

  @Get()
  findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Param('sessionId', new ParseUUIDPipe()) sessionId: string,
  ) {
    return this.minutesService.findAll(user.equipeId, sessionId);
  }

  @Put(':playerId')
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('sessionId', new ParseUUIDPipe()) sessionId: string,
    @Param('playerId', new ParseUUIDPipe()) playerId: string,
    @Body() dto: UpdatePlayerSessionMinutesDto,
  ) {
    return this.minutesService.update(user.equipeId, sessionId, playerId, dto);
  }

  @Post(':playerId/start')
  start(
    @CurrentUser() user: AuthenticatedUser,
    @Param('sessionId', new ParseUUIDPipe()) sessionId: string,
    @Param('playerId', new ParseUUIDPipe()) playerId: string,
  ) {
    return this.minutesService.start(user.equipeId, sessionId, playerId);
  }

  @Post(':playerId/stop')
  stop(
    @CurrentUser() user: AuthenticatedUser,
    @Param('sessionId', new ParseUUIDPipe()) sessionId: string,
    @Param('playerId', new ParseUUIDPipe()) playerId: string,
  ) {
    return this.minutesService.stop(user.equipeId, sessionId, playerId);
  }
}
