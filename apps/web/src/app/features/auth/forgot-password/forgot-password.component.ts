import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    InputTextModule,
    ButtonModule,
    MessageModule,
  ],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss',
})
export class ForgotPasswordComponent {
  private readonly fb = inject(FormBuilder);
  readonly authService = inject(AuthService);

  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);

  forgotPasswordForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  async onSubmit(): Promise<void> {
    if (this.forgotPasswordForm.invalid) {
      this.forgotPasswordForm.markAllAsTouched();
      return;
    }

    this.errorMessage.set(null);
    this.successMessage.set(null);

    const result = await this.authService.forgotPassword(
      this.forgotPasswordForm.value.email
    );

    if (result.success) {
      this.successMessage.set(result.message);
      this.forgotPasswordForm.reset();
    } else {
      this.errorMessage.set(result.message);
    }
  }

  isFieldInvalid(field: string): boolean {
    const control = this.forgotPasswordForm.get(field);
    return !!(control && control.invalid && control.touched);
  }

  getFieldError(field: string): string {
    const control = this.forgotPasswordForm.get(field);
    if (control?.errors) {
      if (control.errors['required']) return 'Email is required';
      if (control.errors['email']) return 'Please enter a valid email';
    }
    return '';
  }
}
