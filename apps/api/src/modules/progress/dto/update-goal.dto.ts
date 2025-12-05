import { IsInt, Min } from 'class-validator';

export class UpdateGoalDto {
  @IsInt()
  @Min(0)
  currentValue: number;
}
