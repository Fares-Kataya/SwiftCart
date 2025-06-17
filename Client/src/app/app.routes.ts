import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { HomeComponent } from './home/home.component';
import { MainComponent } from './main/main.component';
import { AuthComponent } from './auth/auth.component';
import { ProductsComponent } from './products/products.component';
import { AuthGuard } from './auth/auth.guard';
import { CheckoutComponent } from './checkout/checkout.component';
import { ShoppingCartComponent } from './cart/cart.component';
import { ThankYouComponent } from './thank-you/thank-you.component';
import { AdminDashboardComponent } from './admin/admin-dashboard/admin-dashboard.component';
import { DashboardOverviewComponent } from './admin/dashboard-overview/dashboard-overview.component';
import { OrdersManagementComponent } from './admin/orders-management/orders-management.component';
import { ProductsManagementComponent } from './admin/products-management/products-management.component';


export const routes: Routes = [
  {
    path: '',
    component: MainComponent,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./home/home.component').then((c) => c.HomeComponent),
      },
      {
        path: 'products',
        loadComponent: () =>
          import('./products/products.component').then(
            (c) => c.ProductsComponent
          ),
        canActivate: [AuthGuard],
      },
      {
        path: 'about',
        loadComponent: () =>
          import('./about/about.component').then((c) => c.AboutComponent),
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./profile/profile.component').then((c) => c.ProfileComponent),
        canActivate: [AuthGuard],
      },
    ],
  },
  {
    path: 'checkout',
    component: CheckoutComponent,
  },
  {
    path: 'cart',
    component: ShoppingCartComponent,
  },
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.module').then((m) => m.AuthModule),
  },
  { path: 'thank-you', component: ThankYouComponent },
  {
    path: 'admin',
    component: AdminDashboardComponent, // This component acts as the layout for admin
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }, // Default admin view
      { path: 'dashboard', component: DashboardOverviewComponent },
      { path: 'orders', component: OrdersManagementComponent },
      { path: 'products', component: ProductsManagementComponent },
      // Add routes for 'settings', 'marketing', etc. as needed
      { path: 'settings', component: DashboardOverviewComponent }, // Placeholder for settings component
      { path: 'marketing', component: DashboardOverviewComponent }, // Placeholder for marketing component
      { path: 'notifications', component: DashboardOverviewComponent }, // Placeholder
      { path: 'help', component: DashboardOverviewComponent }, // Placeholder
    ],
  },
];
