import { CommonModule } from '@angular/common';
import { Component} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService, LoginPayload } from '../auth.service';
import { RouterModule, Router } from '@angular/router';
@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  showPassword = false;
  rememberMe = false;
  email = '';
  password = '';
  errorMsg?: string;

  constructor(private auth: AuthService, private router: Router) { }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    this.errorMsg = undefined;
    console.log('Login attempt:', {
      email: this.email,
      password: this.password,
      rememberMe: this.rememberMe,
    });
    const payload: LoginPayload = {
      email: this.email,
      password: this.password,
    };

    this.auth.login(payload).subscribe({
      next: () => {
        // rememberMe
        this.router.navigate(['/']);
      },
      error: (err) => {
        let parsed: any;
        if (typeof err.error === 'string') {
          try {
            parsed = JSON.parse(err.error);
          } catch (parseErr) {
            console.warn('Could not JSON-parse error:', parseErr);
            parsed = { message: err.error };
          }
        } else {
          parsed = err.error;
        }

        console.log('Parsed error object:', parsed);
        console.log('Parsed message:', parsed.message);

        this.errorMsg = parsed.message || 'Login failed';
        console.log(this.errorMsg)
      },
    });
  }

  loginWithGoogle() {
    console.log('Login with Google');
    // Implement Google OAuth login
  }

  loginWithFacebook() {
    console.log('Login with Facebook');
    // Implement Facebook OAuth login
  }
}
