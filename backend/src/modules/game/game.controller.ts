import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtPayload } from 'src/infrastructure/auth/jwt.strategy';
import { CurrentUser, JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  CompleteGameDto,
  CompleteGameResponse,
  LifelineDto,
  LifelineResponse,
  StartGameDto,
  StartGameResponse,
  SubmitAnswerDto,
  SubmitAnswerResponse,
} from './game.dto';
import { GameService } from './game.service';

@ApiTags('game')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/game')
export class GameController {
  constructor(private readonly game: GameService) {}

  @Post('start')
  start(@CurrentUser() user: JwtPayload, @Body() dto: StartGameDto): Promise<StartGameResponse> {
    return this.game.start(user.sub, dto);
  }

  @Post('answer')
  @HttpCode(HttpStatus.OK)
  answer(@CurrentUser() user: JwtPayload, @Body() dto: SubmitAnswerDto): Promise<SubmitAnswerResponse> {
    return this.game.submitAnswer(user.sub, dto);
  }

  @Post('complete')
  @HttpCode(HttpStatus.OK)
  complete(@CurrentUser() user: JwtPayload, @Body() dto: CompleteGameDto): Promise<CompleteGameResponse> {
    return this.game.complete(user.sub, dto.sessionId);
  }

  @Post('lifeline')
  @HttpCode(HttpStatus.OK)
  lifeline(@CurrentUser() user: JwtPayload, @Body() dto: LifelineDto): Promise<LifelineResponse> {
    return this.game.lifeline(user.sub, dto);
  }
}
