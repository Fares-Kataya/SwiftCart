import { CommonModule } from '@angular/common';
import { Component} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
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

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    console.log('Login attempt:', {
      email: this.email,
      password: this.password,
      rememberMe: this.rememberMe,
    });
    // Implement your login logic here
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
