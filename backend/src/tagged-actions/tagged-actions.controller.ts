import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { CreateSessionActionsDto } from './dto/create-session-actions.dto';
import { TaggedActionsService } from './tagged-actions.service';

@Controller('sessions/:sessionId/actions')
export class TaggedActionsController {
  constructor(private readonly taggedActionsService: TaggedActionsService) {}

  @Post()
  createForSession(
    @Param('sessionId', new ParseUUIDPipe()) sessionId: string,
    @Body() dto: CreateSessionActionsDto,
  ) {
    return this.taggedActionsService.createForSession(sessionId, dto);
  }

  @Delete(':actionId')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeFromSession(
    @Param('sessionId', new ParseUUIDPipe()) sessionId: string,
    @Param('actionId', new ParseUUIDPipe()) actionId: string,
  ) {
    return this.taggedActionsService.removeFromSession(sessionId, actionId);
  }
}
