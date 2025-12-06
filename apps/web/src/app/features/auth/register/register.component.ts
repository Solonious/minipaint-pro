import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    InputTextModule,
    PasswordModule,
    ButtonModule,
    MessageModule,
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  readonly authService = inject(AuthService);

  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);

  registerForm: FormGroup = this.fb.group({
    displayName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [
      Validators.required,
      Validators.minLength(8),
      Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/)
    ]],
    confirmPassword: ['', [Validators.required]],
  }, { validators: this.passwordMatchValidator });

  passwordMatchValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      return { passwordMismatch: true };
    }
    return null;
  }

  async onSubmit(): Promise<void> {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.errorMessage.set(null);
    this.successMessage.set(null);
    this.authService.clearError();

    const result = await this.authService.register({
      email: this.registerForm.value.email,
      password: this.registerForm.value.password,
      displayName: this.registerForm.value.displayName,
    });

    if (result.success) {
      this.successMessage.set(result.message);
      this.registerForm.reset();
    } else {
      this.errorMessage.set(result.message);
    }
  }

  isFieldInvalid(field: string): boolean {
    const control = this.registerForm.get(field);
    return !!(control && control.invalid && control.touched);
  }

  isPasswordMismatch(): boolean {
    return this.registerForm.hasError('passwordMismatch') &&
      this.registerForm.get('confirmPassword')?.touched === true;
  }

  getFieldError(field: string): string {
    const control = this.registerForm.get(field);
    if (control?.errors) {
      if (control.errors['required']) return `${this.getFieldLabel(field)} is required`;
      if (control.errors['email']) return 'Please enter a valid email';
      if (control.errors['minlength']) return `${this.getFieldLabel(field)} must be at least ${control.errors['minlength'].requiredLength} characters`;
      if (control.errors['maxlength']) return `${this.getFieldLabel(field)} must be at most ${control.errors['maxlength'].requiredLength} characters`;
      if (control.errors['pattern']) return 'Password must contain uppercase, lowercase, number, and special character';
    }
    return '';
  }

  private getFieldLabel(field: string): string {
    const labels: Record<string, string> = {
      displayName: 'Display name',
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Confirm password',
    };
    return labels[field] || field;
  }
}
