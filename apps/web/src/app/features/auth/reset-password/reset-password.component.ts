import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    PasswordModule,
    ButtonModule,
    MessageModule,
  ],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss',
})
export class ResetPasswordComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly authService = inject(AuthService);

  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);
  readonly token = signal<string | null>(null);

  resetPasswordForm: FormGroup = this.fb.group({
    password: ['', [
      Validators.required,
      Validators.minLength(8),
      Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/)
    ]],
    confirmPassword: ['', [Validators.required]],
  }, { validators: this.passwordMatchValidator });

  ngOnInit(): void {
    const tokenParam = this.route.snapshot.queryParamMap.get('token');
    if (!tokenParam) {
      this.errorMessage.set('Invalid reset link. Please request a new password reset.');
    } else {
      this.token.set(tokenParam);
    }
  }

  passwordMatchValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      return { passwordMismatch: true };
    }
    return null;
  }

  async onSubmit(): Promise<void> {
    if (this.resetPasswordForm.invalid || !this.token()) {
      this.resetPasswordForm.markAllAsTouched();
      return;
    }

    this.errorMessage.set(null);
    this.successMessage.set(null);

    const result = await this.authService.resetPassword({
      token: this.token()!,
      password: this.resetPasswordForm.value.password,
    });

    if (result.success) {
      this.successMessage.set(result.message);
      this.resetPasswordForm.reset();
      // Redirect to login after 3 seconds
      setTimeout(() => {
        this.router.navigate(['/auth/login']);
      }, 3000);
    } else {
      this.errorMessage.set(result.message);
    }
  }

  isFieldInvalid(field: string): boolean {
    const control = this.resetPasswordForm.get(field);
    return !!(control && control.invalid && control.touched);
  }

  isPasswordMismatch(): boolean {
    return this.resetPasswordForm.hasError('passwordMismatch') &&
      this.resetPasswordForm.get('confirmPassword')?.touched === true;
  }

  getFieldError(field: string): string {
    const control = this.resetPasswordForm.get(field);
    if (control?.errors) {
      if (control.errors['required']) return `${field === 'password' ? 'Password' : 'Confirm password'} is required`;
      if (control.errors['minlength']) return 'Password must be at least 8 characters';
      if (control.errors['pattern']) return 'Password must contain uppercase, lowercase, number, and special character';
    }
    return '';
  }
}
