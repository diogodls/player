import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CreateSessionActionsDto } from './dto/create-session-actions.dto';
import { TaggedActionsService } from './tagged-actions.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthenticatedUser } from '../auth/authenticated-user.interface';

@UseGuards(JwtAuthGuard)
@Controller('sessions/:sessionId/actions')
export class TaggedActionsController {
  constructor(private readonly taggedActionsService: TaggedActionsService) {}

  @Post()
  createForSession(
    @CurrentUser() userOrSessionId: AuthenticatedUser | string,
    @Param('sessionId', new ParseUUIDPipe())
    sessionIdOrDto: string | CreateSessionActionsDto,
    @Body() maybeDto?: CreateSessionActionsDto,
  ) {
    return typeof userOrSessionId === 'string'
      ? this.taggedActionsService.createForSession(
          userOrSessionId,
          sessionIdOrDto as CreateSessionActionsDto,
        )
      : this.taggedActionsService.createForSession(
          userOrSessionId.equipeId,
          sessionIdOrDto as string,
          maybeDto as CreateSessionActionsDto,
        );
  }

  @Delete(':actionId')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeFromSession(
    @CurrentUser() userOrSessionId: AuthenticatedUser | string,
    @Param('sessionId', new ParseUUIDPipe()) sessionIdOrActionId: string,
    @Param('actionId', new ParseUUIDPipe()) maybeActionId?: string,
  ) {
    return typeof userOrSessionId === 'string'
      ? this.taggedActionsService.removeFromSession(
          userOrSessionId,
          sessionIdOrActionId,
        )
      : this.taggedActionsService.removeFromSession(
          userOrSessionId.equipeId,
          sessionIdOrActionId,
          maybeActionId as string,
        );
  }
}
