import { AfterViewInit, Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import { AuthService, RegisterPayload } from '../auth.service';
import { initFlowbite } from 'flowbite';
import {
  RouterOutlet,
  Router,
  NavigationEnd,
  RouterModule,
} from '@angular/router';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-register',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    LucideAngularModule,
    RouterModule,
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent implements AfterViewInit {
  userType = signal<'buyer' | 'seller' | null>(null);
  showPassword = signal(false);
  showConfirmPassword = signal(false);
  registerForm: FormGroup;
  errorMsg?: string;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group(
      {
        firstName: ['', [Validators.required]],
        lastName: ['', [Validators.required]],
        username: ['', [Validators.required, Validators.minLength(4)]],
        email: ['', [Validators.required, Validators.email]],
        phone: [
          '',
          [Validators.required, Validators.pattern(/^[0-9()+\-\s]+$/)],
        ],

        password: [
          '',
          [
            Validators.required,
            Validators.minLength(8),
            Validators.pattern(
              /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/
            ),
          ],
        ],
        gender: ['', [Validators.required]],
        image: [''],
        confirmPassword: ['', [Validators.required]],
        agreeToTerms: [false, [Validators.requiredTrue]],
        subscribeNewsletter: [false],
      },
      { validators: this.passwordMatchValidator }
    );
  }

  ngAfterViewInit() {
    initFlowbite();
    this.router.events
      .pipe(filter((evt) => evt instanceof NavigationEnd))
      .subscribe(() => initFlowbite());
  }

  setUserType(type: 'buyer' | 'seller' | null) {
    this.userType.set(type);
  }

  togglePasswordVisibility() {
    this.showPassword.set(!this.showPassword());
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword.set(!this.showConfirmPassword());
  }
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      // base64-encoded data URL
      this.registerForm.patchValue({ image: reader.result as string });
    };
    reader.readAsDataURL(file);
  }

  passwordMatchValidator(form: AbstractControl): ValidationErrors | null {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');

    if (
      password &&
      confirmPassword &&
      password.value !== confirmPassword.value
    ) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }

    if (confirmPassword?.hasError('passwordMismatch')) {
      const errors = { ...confirmPassword.errors };
      delete errors['passwordMismatch'];
      confirmPassword.setErrors(Object.keys(errors).length > 0 ? errors : null);
    }

    return null;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.registerForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getFieldError(fieldName: string): string {
    const field = this.registerForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) return `${fieldName} is required`;
      if (field.errors['email']) return 'Please enter a valid email';
      if (field.errors['minlength'])
        return `Minimum ${field.errors['minlength'].requiredLength} characters required`;
      if (field.errors['pattern'] && fieldName === 'phone')
        return 'Please enter a valid phone number';
      if (field.errors['pattern'] && fieldName === 'password')
        return 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
      if (field.errors['passwordMismatch']) return 'Passwords do not match';
    }
    return '';
  }

  onSubmit() {
    if (this.registerForm.valid && this.userType()) {
      const formData = {
        ...this.registerForm.value,
        userType: this.userType(),
      };
      console.log('Registration data:', formData);
      const payload: RegisterPayload = this.registerForm.value;
      this.auth.register(payload).subscribe({
        next: () => this.router.navigate(['/auth/login']),
        error: (err) =>
          (this.errorMsg = err.error?.message || 'Registration failed'),
      });
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.registerForm.controls).forEach((key) => {
        this.registerForm.get(key)?.markAsTouched();
      });
    }
  }
}
