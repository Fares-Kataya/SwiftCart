// src/app/order-history/order-history.component.ts
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { LucideAngularModule } from 'lucide-angular';
import { environment } from '../../environments/environment';

interface OrderItemDto {
  id?: number;
  productId: number;
  quantity: number;
  unitPrice: number;
}

interface OrderDto {
  id: number;
  items: OrderItemDto[];
  totalPrice: number;
  status: string;
  orderDate: string;
}

@Component({
  selector: 'app-order-history',
  standalone: true,
  imports: [CommonModule, HttpClientModule, LucideAngularModule, DatePipe],
  templateUrl: './order-history.component.html',
  styleUrls: ['./order-history.component.css'],
})
export class OrderHistoryComponent implements OnInit {
  orders = signal<OrderDto[]>([]);
  isLoading = signal<boolean>(true);
  error = signal<string | null>(null);

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchOrders();
  }

  fetchOrders(): void {
    this.isLoading.set(true);
    this.error.set(null);

    const url = `${environment.apiUrl}/orders`;

    this.http.get<OrderDto[]>(url).subscribe({
      next: (data) => {
        this.orders.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to fetch orders:', err);
        this.error.set('Failed to load order history. Please try again later.');
        this.isLoading.set(false);
        if (err.status === 401 || err.status === 403) {
          this.error.set(
            'You are not authorized to view this content. Please log in.'
          );
        }
      },
    });
  }

  // New method to handle order cancellation
  cancelOrder(orderId: number): void {
    if (
      !confirm(
        'Are you sure you want to cancel this order? This action cannot be undone.'
      )
    ) {
      return; // User cancelled the confirmation
    }

    const url = `${environment.apiUrl}/orders/${orderId}`;
    this.isLoading.set(true); // Optionally show loading state during cancellation

    this.http.delete(url).subscribe({
      next: () => {
        console.log(`Order ${orderId} cancelled successfully.`);
        // Re-fetch orders to update the UI with the new status
        this.fetchOrders();
        alert('Order cancelled successfully!');
      },
      error: (err) => {
        console.error(`Failed to cancel order ${orderId}:`, err);
        let errorMessage = 'Failed to cancel order. Please try again.';
        if (err.error && err.error.message) {
          errorMessage = err.error.message; // Use message from backend (e.g., "Can only cancel pending orders.")
        } else if (err.message) {
          errorMessage = err.message;
        }
        this.error.set(errorMessage);
        this.isLoading.set(false); // Hide loading state on error
        alert(errorMessage);
      },
    });
  }

  trackByOrder(index: number, order: OrderDto): number {
    return order.id;
  }

  trackByOrderItem(index: number, item: OrderItemDto): number | undefined {
    return item.id;
  }
}
