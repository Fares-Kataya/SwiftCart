import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService, UserProfile } from '../../auth/auth.service';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { of, Subscription } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { CartService, CartProduct } from '../../services/cart.service';

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

  private subscriptions = new Subscription(); // Still needed for AuthService subscriptions

  // Inject CartService and make it public so template can access its signals
  constructor(private auth: AuthService, public cartService: CartService) {}

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

  // Use CartProduct from the service
  trackByCartItem(index: number, item: CartProduct): number {
    return item.id;
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  // Changed from removeFromCart to removeItem to match CartService
  removeItem(productId: number) {
    this.cartService.removeItem(productId); // Delegate to CartService
    // Toast messages are handled by CartService directly
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
