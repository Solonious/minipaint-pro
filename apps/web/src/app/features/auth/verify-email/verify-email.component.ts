import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ButtonModule,
    MessageModule,
    ProgressSpinnerModule,
  ],
  templateUrl: './verify-email.component.html',
  styleUrl: './verify-email.component.scss',
})
export class VerifyEmailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly authService = inject(AuthService);

  readonly verifying = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);

  async ngOnInit(): Promise<void> {
    const token = this.route.snapshot.queryParamMap.get('token');

    if (!token) {
      this.verifying.set(false);
      this.errorMessage.set('Invalid verification link. Please check your email for the correct link.');
      return;
    }

    const result = await this.authService.verifyEmail(token);
    this.verifying.set(false);

    if (result.success) {
      this.successMessage.set(result.message);
      // Redirect to login after 3 seconds
      setTimeout(() => {
        this.router.navigate(['/auth/login']);
      }, 3000);
    } else {
      this.errorMessage.set(result.message);
    }
  }
}
