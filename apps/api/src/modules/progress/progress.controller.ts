import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ProgressService } from './progress.service';
import { LogSessionDto } from './dto/log-session.dto';
import { UpdateGoalDto } from './dto/update-goal.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('progress')
@ApiBearerAuth()
@Controller('progress')
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Get()
  @ApiOperation({ summary: 'Get user progress with achievements and goals' })
  getProgress(@CurrentUser('id') userId: string) {
    return this.progressService.getProgress(userId);
  }

  @Post('session')
  @ApiOperation({ summary: 'Log a painting session - updates streak and checks achievements' })
  logSession(@CurrentUser('id') userId: string, @Body() dto: LogSessionDto) {
    return this.progressService.logSession(userId, dto);
  }

  @Get('achievements')
  @ApiOperation({ summary: 'Get all achievements with unlock status' })
  getAchievements(@CurrentUser('id') userId: string) {
    return this.progressService.getAchievementsWithStatus(userId);
  }

  @Get('goals')
  @ApiOperation({ summary: 'Get current week goals' })
  getGoals(@CurrentUser('id') userId: string) {
    return this.progressService.getGoals(userId);
  }

  @Patch('goals/:id')
  @ApiOperation({ summary: 'Update goal progress' })
  updateGoal(@Param('id') id: string, @Body() dto: UpdateGoalDto) {
    return this.progressService.updateGoal(id, dto);
  }
}
