import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService, UserProfile } from '../../auth/auth.service';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { of, Subscription } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';

@Component({
  selector: 'app-navbar',
  imports: [RouterModule, LucideAngularModule, CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent implements OnInit, OnDestroy {
  token = signal<string | null>(null);
  user = signal<UserProfile | null>(null);
  isLoading = signal<boolean>(false);

  private subscriptions = new Subscription();

  constructor(private auth: AuthService) {}

  ngOnInit() {
    const tokenSub = this.auth.token$
      .pipe(
        switchMap((token) => {
          this.token.set(token);

          if (!token) {
            this.user.set(null);
            this.isLoading.set(false);
            return of(null);
          }

          this.isLoading.set(true);
          return this.auth.me().pipe(
            catchError(() => {
              this.user.set(null);
              return of(null);
            })
          );
        })
      )
      .subscribe((userProfile) => {
        this.user.set(userProfile);
        this.isLoading.set(false);
      });

    this.subscriptions.add(tokenSub);
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  logout() {
    this.auth.logout();
  }

  get isAuthenticated() {
    return this.token() !== null;
  }

  get userDisplayName() {
    const currentUser = this.user();
    if (currentUser?.firstName && currentUser?.lastName) {
      return `${currentUser.firstName} ${currentUser.lastName}`;
    }
    return currentUser?.username || currentUser?.email || 'User';
  }

  get userFullName() {
    const currentUser = this.user();
    if (currentUser?.firstName || currentUser?.lastName) {
      return `${currentUser?.firstName || ''} ${
        currentUser?.lastName || ''
      }`.trim();
    }
    return null;
  }
}
