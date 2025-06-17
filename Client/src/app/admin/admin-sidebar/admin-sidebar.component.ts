// src/app/admin/admin-sidebar/admin-sidebar.component.ts
import { Component, OnInit } from '@angular/core'; // Import OnInit
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-admin-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, LucideAngularModule],
  templateUrl: './admin-sidebar.component.html',
  styleUrls: ['./admin-sidebar.component.css'],
})
export class AdminSidebarComponent implements OnInit {
  // Implement OnInit
  navigationItems = [
    { title: 'Dashboard', path: '/admin/dashboard', icon: 'LayoutDashboard' },
    { title: 'Orders', path: '/admin/orders', icon: 'ShoppingCart' },
    { title: 'Products', path: '/admin/products', icon: 'Package' },
    { title: 'Users', path: '/admin/users', icon: 'Users' },
    { title: 'Settings', path: '/admin/settings', icon: 'Settings' },
  ];

  secondaryItems = [
    /* ... your secondary items ... */
  ]; // Keep your secondary items if you have them

  ngOnInit(): void {
    console.log(
      'AdminSidebarComponent: navigationItems ->',
      this.navigationItems
    );
  }
}
