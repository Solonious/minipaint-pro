import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ProgressService } from './progress.service';
import { LogSessionDto } from './dto/log-session.dto';
import { UpdateGoalDto } from './dto/update-goal.dto';

const TEMP_USER_ID = 'default-user';

@ApiTags('progress')
@Controller('progress')
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Get()
  @ApiOperation({ summary: 'Get user progress' })
  getProgress() {
    return this.progressService.getProgress(TEMP_USER_ID);
  }

  @Post('session')
  @ApiOperation({ summary: 'Log a painting session' })
  logSession(@Body() dto: LogSessionDto) {
    return this.progressService.logSession(TEMP_USER_ID, dto);
  }

  @Get('achievements')
  @ApiOperation({ summary: 'Get all achievements' })
  getAchievements() {
    return this.progressService.getAchievements();
  }

  @Get('goals')
  @ApiOperation({ summary: 'Get weekly goals' })
  getGoals() {
    return this.progressService.getGoals(TEMP_USER_ID);
  }

  @Patch('goals/:id')
  @ApiOperation({ summary: 'Update goal progress' })
  updateGoal(@Param('id') id: string, @Body() dto: UpdateGoalDto) {
    return this.progressService.updateGoal(id, dto);
  }
}
