import { Body, Controller, Param, ParseUUIDPipe, Post, UseGuards } from '@nestjs/common';
import { CreateSessionActionsDto } from './dto/create-session-actions.dto';
import { TaggedActionsService } from './tagged-actions.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
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
}
