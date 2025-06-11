import { Component, signal, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { AuthService, UserProfile } from '../auth/auth.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent implements OnInit, OnDestroy {
  private auth = inject(AuthService);
  private fb = inject(FormBuilder);
  private destroy$ = new Subject<void>();

  user = signal<UserProfile | null>(null);
  activeTab = signal<'profile' | 'security' | 'preferences'>('profile');
  isEditing = signal(false);
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  profileForm: FormGroup;
  passwordForm: FormGroup;

  constructor() {
    this.profileForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.maxLength(50)]],
      lastName: ['', [Validators.required, Validators.maxLength(50)]],
      email: [
        '',
        [Validators.required, Validators.email, Validators.maxLength(100)],
      ],
      phone: [
        '',
        [Validators.pattern(/^[0-9()+\-\s]*$/), Validators.maxLength(20)],
      ],
    });

    this.passwordForm = this.fb.group(
      {
        currentPassword: ['', [Validators.required]],
        newPassword: [
          '',
          [
            Validators.required,
            Validators.minLength(8),
            Validators.pattern(
              /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/
            ),
          ],
        ],
        confirmPassword: ['', [Validators.required]],
      },
      { validators: this.passwordMatchValidator }
    );
  }

  ngOnInit() {
    this.loadUserProfile();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadUserProfile() {
    this.isLoading.set(true);
    this.auth
      .me()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (user) => {
          this.user.set(user);
          this.buildProfileForm(user);
          this.isLoading.set(false);
        },
        error: (error) => {
          console.error('Failed to load user profile:', error);
          this.errorMessage.set('Failed to load profile. Please try again.');
          this.isLoading.set(false);
        },
      });
  }

  passwordMatchValidator(form: AbstractControl): ValidationErrors | null {
    const password = form.get('newPassword');
    const confirmPassword = form.get('confirmPassword');

    if (!password || !confirmPassword) {
      return null;
    }

    if (password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }

    if (confirmPassword.hasError('passwordMismatch')) {
      const errors = { ...confirmPassword.errors };
      delete errors['passwordMismatch'];
      confirmPassword.setErrors(Object.keys(errors).length > 0 ? errors : null);
    }

    return null;
  }

  private buildProfileForm(user: UserProfile | null) {
    if (!user) {
      this.profileForm.reset({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
      });
      return;
    }

    this.profileForm.patchValue({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      phone: user.phone || '',
    });
  }

  setActiveTab(tab: 'profile' | 'security' | 'preferences') {
    this.activeTab.set(tab);
    this.errorMessage.set(null);
  }

  toggleEdit() {
    if (this.isEditing()) {
      this.saveProfile();
    } else {
      this.isEditing.set(true);
    }
  }

  cancelEdit() {
    this.isEditing.set(false);
    this.buildProfileForm(this.user());
    this.errorMessage.set(null);
  }

  saveProfile() {
    if (!this.profileForm.valid) {
      this.markFormGroupTouched(this.profileForm);
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.auth
      .updateProfile(this.profileForm.value)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updated) => {
          this.user.set(updated);
          this.isEditing.set(false);
          this.isLoading.set(false);
          console.log('Profile updated successfully:', updated);
        },
        error: (error) => {
          console.error('Failed to update profile:', error);
          this.errorMessage.set('Failed to update profile. Please try again.');
          this.isLoading.set(false);
        },
      });
  }

  updatePassword() {
    if (!this.passwordForm.valid) {
      this.markFormGroupTouched(this.passwordForm);
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.auth
      .updatePassword(this.passwordForm.value)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.passwordForm.reset();
          this.isLoading.set(false);
          console.log('Password updated successfully');
        },
        error: (error) => {
          console.error('Failed to update password:', error);
          this.errorMessage.set('Failed to update password. Please try again.');
          this.isLoading.set(false);
        },
      });
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach((key) => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  signOut() {
    this.auth.logout();
  }

  getFieldError(formGroup: FormGroup, fieldName: string): string | null {
    const field = formGroup.get(fieldName);
    if (field && field.errors && field.touched) {
      if (field.errors['required']) return `${fieldName} is required`;
      if (field.errors['email']) return 'Please enter a valid email';
      if (field.errors['minlength'])
        return `Minimum length is ${field.errors['minlength'].requiredLength}`;
      if (field.errors['maxlength'])
        return `Maximum length is ${field.errors['maxlength'].requiredLength}`;
      if (field.errors['pattern']) return 'Invalid format';
      if (field.errors['passwordMismatch']) return 'Passwords do not match';
    }
    return null;
  }

  hasFieldError(formGroup: FormGroup, fieldName: string): boolean {
    const field = formGroup.get(fieldName);
    return !!(field && field.errors && field.touched);
  }
}
