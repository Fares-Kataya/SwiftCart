import { Component, OnInit, signal } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { LucideAngularModule } from 'lucide-angular';
import { environment } from '../../../environments/environment';
import { FormsModule } from '@angular/forms'; // Required for ngModel for status dropdown

// Re-using backend DTO interfaces
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
  userEmail?: string; // Assuming admin view needs user email
  customerFirstName?: string;
  customerLastName?: string;
}

@Component({
  selector: 'app-orders-management',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    LucideAngularModule,
    CurrencyPipe,
    DatePipe,
    FormsModule, // Import FormsModule
  ],
  templateUrl: './orders-management.component.html',
  styleUrls: ['./orders-management.component.css'],
})
export class OrdersManagementComponent implements OnInit {
  allOrders = signal<OrderDto[]>([]);
  isLoading = signal<boolean>(true);
  error = signal<string | null>(null);

  // Available order statuses for dropdown
  orderStatuses = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchAllOrders();
  }

  fetchAllOrders(): void {
    this.isLoading.set(true);
    this.error.set(null);

    const url = `${environment.apiUrl}/orders/all`; // Admin endpoint to get all orders

    this.http.get<OrderDto[]>(url).subscribe({
      next: (data) => {
        this.allOrders.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to fetch all orders:', err);
        this.error.set('Failed to load all orders. Please try again later.');
        this.isLoading.set(false);
        if (err.status === 401 || err.status === 403) {
          this.error.set(
            'You are not authorized to view all orders. Admin privileges required.'
          );
        }
      },
    });
  }

  updateOrderStatus(orderId: number, newStatus: string): void {
    // IMPORTANT: Replace alert with a custom modal for better UX
    if (
      !confirm(
        `Are you sure you want to change status of Order ID ${orderId} to ${newStatus}?`
      )
    ) {
      return;
    }

    const url = `${environment.apiUrl}/orders/${orderId}/status?status=${newStatus}`; // Backend endpoint for status update

    this.http.put(url, {}).subscribe({
      // PUT request, empty body as status is in query param
      next: () => {
        console.log(`Order ${orderId} status updated to ${newStatus}`);
        // Optimistically update the local signal, or re-fetch for absolute accuracy
        this.allOrders.update((orders) =>
          orders.map((order) =>
            order.id === orderId ? { ...order, status: newStatus } : order
          )
        );
        alert(`Order ${orderId} status updated to ${newStatus}.`);
      },
      error: (err) => {
        console.error(`Failed to update status for order ${orderId}:`, err);
        let errorMessage = 'Failed to update order status.';
        if (err.error && err.error.message) {
          errorMessage = err.error.message;
        } else if (err.message) {
          errorMessage = err.message;
        }
        alert(errorMessage);
      },
    });
  }

  deleteOrder(orderId: number): void {
    // IMPORTANT: Replace alert with a custom modal for better UX
    if (
      !confirm(
        `Are you sure you want to delete Order ID ${orderId}? This action cannot be undone.`
      )
    ) {
      return;
    }

    const url = `${environment.apiUrl}/orders/${orderId}`; // Backend endpoint for deleting order

    this.http.delete(url).subscribe({
      next: () => {
        console.log(`Order ${orderId} deleted successfully.`);
        this.allOrders.update((orders) =>
          orders.filter((order) => order.id !== orderId)
        ); // Remove from local signal
        alert(`Order ${orderId} deleted successfully.`);
      },
      error: (err) => {
        console.error(`Failed to delete order ${orderId}:`, err);
        let errorMessage = 'Failed to delete order.';
        if (err.error && err.error.message) {
          errorMessage = err.error.message;
        } else if (err.message) {
          errorMessage = err.message;
        }
        alert(errorMessage);
      },
    });
  }

  // Helper for status badge colors
  getStatusClass(status: string): string {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CONFIRMED':
        return 'bg-blue-100 text-blue-800';
      case 'SHIPPED':
        return 'bg-purple-100 text-purple-800';
      case 'DELIVERED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  trackByOrder(index: number, order: OrderDto): number {
    return order.id;
  }
}
