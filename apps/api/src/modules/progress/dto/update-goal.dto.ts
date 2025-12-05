import { IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateGoalDto {
  @ApiProperty({ example: 2, description: 'New current value for the goal' })
  @IsInt()
  @Min(0)
  currentValue: number;
}
