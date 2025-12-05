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

// For MVP without auth, use a visitor ID
const TEMP_VISITOR_ID = 'default-visitor';

@ApiTags('progress')
@Controller('progress')
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Get()
  @ApiOperation({ summary: 'Get user progress with achievements and goals' })
  getProgress() {
    return this.progressService.getProgress(TEMP_VISITOR_ID);
  }

  @Post('session')
  @ApiOperation({ summary: 'Log a painting session - updates streak and checks achievements' })
  logSession(@Body() dto: LogSessionDto) {
    return this.progressService.logSession(TEMP_VISITOR_ID, dto);
  }

  @Get('achievements')
  @ApiOperation({ summary: 'Get all achievements with unlock status' })
  getAchievements() {
    return this.progressService.getAchievementsWithStatus(TEMP_VISITOR_ID);
  }

  @Get('goals')
  @ApiOperation({ summary: 'Get current week goals' })
  getGoals() {
    return this.progressService.getGoals(TEMP_VISITOR_ID);
  }

  @Patch('goals/:id')
  @ApiOperation({ summary: 'Update goal progress' })
  updateGoal(@Param('id') id: string, @Body() dto: UpdateGoalDto) {
    return this.progressService.updateGoal(id, dto);
  }
}
