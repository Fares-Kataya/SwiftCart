// src/app/profile/profile.component.ts
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { environment } from '../../environments/environment';

import { OrderHistoryComponent } from '../order-history/order-history.component';

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role?: string;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    LucideAngularModule,
    HttpClientModule,
    OrderHistoryComponent,
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit {
  user = signal<User | null>(null);
  activeTab = signal<
    | 'profile'
    | 'orderHistory'
    | 'addresses'
    | 'payment'
    | 'wishlist'
    | 'settings'
  >('profile');

  isEditing = signal<boolean>(false);
  profileForm: FormGroup;

  isProfileLoading = signal<boolean>(true);
  profileError = signal<string | null>(null);

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.profileForm = this.fb.group({
      firstName: [{ value: '', disabled: true }, Validators.required],
      lastName: [{ value: '', disabled: true }, Validators.required],
      email: [
        { value: '', disabled: true },
        [Validators.required, Validators.email],
      ],
      phone: [{ value: '', disabled: true }],
    });
  }

  ngOnInit(): void {
    this.fetchUserProfile();
  }

  fetchUserProfile(): void {
    this.isProfileLoading.set(true);
    this.profileError.set(null);

    const url = `${environment.apiUrl}/users/me`;

    this.http.get<User>(url).subscribe({
      next: (data) => {
        this.user.set(data);
        this.profileForm.patchValue(data);
        this.profileForm.disable();
        this.isProfileLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to fetch user profile:', err);
        this.profileError.set(
          'Failed to load profile. Please ensure you are logged in and the backend is running.'
        );
        this.isProfileLoading.set(false);
        if (err.status === 401 || err.status === 403) {
          this.profileError.set('Authentication required. Please log in.');
        }
      },
    });
  }

  setActiveTab(
    tab:
      | 'profile'
      | 'orderHistory'
      | 'addresses'
      | 'payment'
      | 'wishlist'
      | 'settings'
  ): void {
    this.activeTab.set(tab);
    if (tab !== 'profile' && this.isEditing()) {
      this.isEditing.set(false);
      this.profileForm.disable();
      if (this.user()) {
        this.profileForm.patchValue(this.user()!);
      }
    }
  }

  toggleEdit(): void {
    if (this.isEditing()) {
      if (this.profileForm.valid) {
        // No need for currentUser.id check here, as it's not part of the URL anymore
        // However, keep the currentUser check just to ensure user data is loaded
        const currentUser = this.user();
        if (!currentUser) {
          alert('Cannot save changes: User data not loaded.');
          return;
        }

        console.log('Saving profile changes:', this.profileForm.value);
        // UserProfileUpdateDto usually doesn't include ID, as it's for partial updates
        // Send only the fields relevant to UserProfileUpdateDto
        const updatePayload = {
          firstName: this.profileForm.value.firstName,
          lastName: this.profileForm.value.lastName,
          email: this.profileForm.value.email,
          phone: this.profileForm.value.phone,
          // Assuming gender and image are also part of UserProfileUpdateDto if they exist in form
          // gender: this.profileForm.value.gender,
          // image: this.profileForm.value.image
        };

        this.isProfileLoading.set(true);
        this.profileError.set(null);

        // CHANGE THIS LINE: Use /api/users/me instead of /api/users/${currentUser.id}
        this.http
          .put<User>(`${environment.apiUrl}/users/me`, updatePayload)
          .subscribe({
            next: (response) => {
              console.log('Profile updated successfully:', response);
              this.isEditing.set(false);
              this.profileForm.disable();
              this.user.set(response); // Update with the response from backend
              this.isProfileLoading.set(false);
              alert('Profile updated successfully!');
            },
            error: (err) => {
              console.error('Failed to save profile changes:', err);
              let errorMessage = 'Failed to save changes. Please try again.';
              if (err.error && err.error.message) {
                errorMessage = err.error.message; // Use message from backend (e.g., validation errors)
              } else if (err.message) {
                errorMessage = err.message;
              } else if (err.statusText) {
                errorMessage = err.statusText;
              }
              this.profileError.set(errorMessage);
              this.isProfileLoading.set(false);
              alert(errorMessage);
              // Revert form to previous user data on save error
              if (currentUser) {
                this.profileForm.patchValue(currentUser);
              }
            },
          });
      } else {
        alert('Please fill in all required fields correctly.');
        this.profileForm.markAllAsTouched();
      }
    } else {
      this.isEditing.set(true);
      this.profileForm.enable();
    }
  }
}
