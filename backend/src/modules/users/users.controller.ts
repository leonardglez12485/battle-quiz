import { Controller, DefaultValuePipe, Get, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtPayload } from 'src/infrastructure/auth/jwt.strategy';
import { CurrentUser, JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AchievementEntry, HistoryEntry, ProfileResponse, RankingEntry } from './users.dto';
import { UsersService } from './users.service';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get('me')
  me(@CurrentUser() user: JwtPayload): Promise<ProfileResponse> {
    return this.users.profile(user.sub);
  }

  @Get('ranking')
  ranking(
    @CurrentUser() user: JwtPayload,
    @Query('count', new DefaultValuePipe(50), ParseIntPipe) count: number,
  ): Promise<RankingEntry[]> {
    return this.users.ranking(user.sub, Math.min(count, 100));
  }

  @Get('me/history')
  history(
    @CurrentUser() user: JwtPayload,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('pageSize', new DefaultValuePipe(20), ParseIntPipe) pageSize: number,
  ): Promise<HistoryEntry[]> {
    return this.users.history(user.sub, Math.max(1, page), Math.min(pageSize, 50));
  }

  @Get('me/achievements')
  achievements(@CurrentUser() user: JwtPayload): Promise<AchievementEntry[]> {
    return this.users.achievementsFor(user.sub);
  }
}
