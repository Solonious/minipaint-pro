import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { GoalType } from '@minipaint-pro/types';
import {
  ProgressService,
  AchievementWithStatus,
} from '../../core/services/progress.service';
import { MiniatureService } from '../../core/services/miniature.service';
import { AchievementBadgeComponent } from '../../shared/components/achievement-badge/achievement-badge.component';
import { GoalProgressComponent } from '../../shared/components/goal-progress/goal-progress.component';
import { ProgressRingComponent } from '../../shared/components/progress-ring/progress-ring.component';

interface GoalTypeOption {
  label: string;
  value: GoalType;
}

const GOAL_TYPE_OPTIONS: GoalTypeOption[] = [
  { label: 'Models', value: 'models' },
  { label: 'Hours', value: 'hours' },
  { label: 'Characters', value: 'characters' },
  { label: 'Vehicles', value: 'vehicles' },
];

@Component({
  selector: 'app-progress',
  standalone: true,
  imports: [
    FormsModule,
    DialogModule,
    InputTextModule,
    InputNumberModule,
    SelectModule,
    ButtonModule,
    AchievementBadgeComponent,
    GoalProgressComponent,
    ProgressRingComponent,
  ],
  templateUrl: './progress.component.html',
  styleUrl: './progress.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgressComponent implements OnInit {
  private readonly progressService = inject(ProgressService);
  private readonly miniatureService = inject(MiniatureService);

  ngOnInit(): void {
    // Load miniatures for progress calculations
    this.miniatureService.loadAll();
  }

  readonly goalTypeOptions = GOAL_TYPE_OPTIONS;

  readonly currentStreak = this.progressService.currentStreak;
  readonly bestStreak = this.progressService.bestStreak;
  readonly lastPaintedDate = this.progressService.lastPaintedDate;
  readonly totalModelsPainted = this.progressService.totalModelsPainted;
  readonly totalPoints = this.progressService.totalPoints;

  readonly achievementsWithStatus = this.progressService.achievementsWithStatus;
  readonly unlockedCount = this.progressService.unlockedCount;
  readonly totalAchievements = this.progressService.totalAchievements;

  readonly activeGoals = this.progressService.activeGoals;
  readonly completedGoalsCount = this.progressService.completedGoalsCount;

  readonly achievementProgress = computed(
    () => Math.round((this.unlockedCount() / this.totalAchievements()) * 100)
  );

  readonly streakStatus = computed(() => {
    const lastDate = this.lastPaintedDate();
    if (!lastDate) return 'inactive';

    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    if (lastDate === today) return 'active';
    if (lastDate === yesterday) return 'warning';
    return 'broken';
  });

  readonly formattedLastPainted = computed(() => {
    const date = this.lastPaintedDate();
    if (!date) return 'Never';

    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    if (date === today) return 'Today';
    if (date === yesterday) return 'Yesterday';

    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  });

  readonly unlockedAchievements = computed(() =>
    this.achievementsWithStatus().filter((a) => a.unlocked)
  );

  readonly lockedAchievements = computed(() =>
    this.achievementsWithStatus().filter((a) => !a.unlocked)
  );

  goalDialogVisible = signal(false);
  goalForm = {
    name: '',
    type: 'models' as GoalType,
    targetValue: 5,
  };

  openGoalDialog(): void {
    this.goalForm = {
      name: '',
      type: 'models',
      targetValue: 5,
    };
    this.goalDialogVisible.set(true);
  }

  closeGoalDialog(): void {
    this.goalDialogVisible.set(false);
  }

  isGoalFormValid(): boolean {
    return this.goalForm.name.trim().length > 0 && this.goalForm.targetValue > 0;
  }

  onSaveGoal(): void {
    if (!this.isGoalFormValid()) return;

    const weekDates = this.progressService.getWeekDates();
    this.progressService.addGoal({
      name: this.goalForm.name.trim(),
      type: this.goalForm.type,
      targetValue: this.goalForm.targetValue,
      weekStart: weekDates.start,
      weekEnd: weekDates.end,
    });

    this.closeGoalDialog();
  }

  onIncrementGoal(goalId: string): void {
    this.progressService.incrementGoalProgress(goalId);
  }

  onDeleteGoal(goalId: string): void {
    this.progressService.deleteGoal(goalId);
  }

  onLogSession(): void {
    this.progressService.logPaintingSession();
  }

  getGoalTypeLabel(type: GoalType): string {
    return this.progressService.getGoalTypeLabel(type);
  }

  trackAchievement(_index: number, achievement: AchievementWithStatus): string {
    return achievement.id;
  }
}
