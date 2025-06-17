// src/app/admin/dashboard-overview/dashboard-overview.component.ts
import { Component, OnInit, signal } from '@angular/core';
import {
  CommonModule,
  CurrencyPipe,
  DatePipe,
  DecimalPipe,
} from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import {
  HttpClient,
  HttpClientModule,
  HttpErrorResponse,
} from '@angular/common/http'; // <--- Import HttpClient and HttpErrorResponse
import { environment } from '../../../environments/environment';
// Import ProductService and its ProductDto from the correct path
import {
  ProductService,
  ProductDto as ProductDtoFromService,
  PagedResult,
} from '../../services/product.service'; // Use alias to avoid conflict with local ProductDto

// Re-using OrderDto and UserDto interfaces from previous contexts for consistency
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
  userEmail?: string;
  customerFirstName?: string;
  customerLastName?: string;
}

@Component({
  selector: 'app-dashboard-overview',
  standalone: true,
  imports: [
    CommonModule,
    LucideAngularModule,
    HttpClientModule, // Keep HttpClientModule as it's required for HttpClient to be available
    CurrencyPipe,
    DatePipe,
    DecimalPipe,
  ],
  templateUrl: './dashboard-overview.component.html',
  styleUrls: ['./dashboard-overview.component.css'],
})
export class DashboardOverviewComponent implements OnInit {
  totalRevenue = signal<number>(45231.89);
  totalOrders = signal<number>(2350);
  totalCustomers = signal<number>(12234);
  productsSold = signal<number>(573);

  recentOrders = signal<OrderDto[]>([]);
  topProducts = signal<ProductDtoFromService[]>([]); // Use ProductDto from service

  isLoadingDashboard = signal<boolean>(true);
  errorDashboard = signal<string | null>(null);

  // Inject the ProductService alongside HttpClient
  constructor(
    private http: HttpClient,
    private productService: ProductService
  ) {}

  ngOnInit(): void {
    this.fetchDashboardData();
  }

  fetchDashboardData(): void {
    this.isLoadingDashboard.set(true);
    this.errorDashboard.set(null);

    // Fetch Recent Orders (assuming an admin endpoint like /api/orders/all)
    // Keep using HttpClient directly for orders if ProductService doesn't cover it
    this.http.get<OrderDto[]>(`${environment.apiUrl}/orders/all`).subscribe({
      next: (ordersData: OrderDto[]) => {
        // <--- Explicitly type ordersData
        this.recentOrders.set(ordersData.slice(0, 5));
        // Do not set isLoadingDashboard false yet, wait for all data
      },
      error: (err: HttpErrorResponse) => {
        // <--- Explicitly type err
        console.error('Failed to fetch recent orders:', err);
        this.errorDashboard.set(
          'Failed to load recent orders: ' + (err.message || err.statusText)
        );
        this.isLoadingDashboard.set(false); // If orders are the only thing, set false here
      },
    });

    // Fetch Top Products using the ProductService
    // Assuming 'newest' sort might approximate "top" or you'd need a specific backend endpoint for actual "top selling"
    // For a real "top products" list, your backend would need an endpoint that returns products sorted by sales or popularity.
    // For now, let's fetch the newest products and display a few of them.
    this.productService.list({ page: 1, size: 4, sort: 'newest' }).subscribe({
      // Fetch 4 newest products
      next: (pagedResult: PagedResult<ProductDtoFromService>) => {
        this.topProducts.set(pagedResult.items); // Set the items
        this.isLoadingDashboard.set(false); // Set loading to false once both (or all) fetches are done
      },
      error: (err: HttpErrorResponse) => {
        // <--- Explicitly type err
        console.error('Failed to fetch top products:', err);
        // If orders fetching also failed, this might overwrite the error.
        // You might want to combine errors or use a more sophisticated loading/error state.
        this.errorDashboard.set(
          (this.errorDashboard() || '') +
            ' Failed to load top products: ' +
            (err.message || err.statusText)
        );
        this.isLoadingDashboard.set(false);
      },
    });

    // TODO: Implement fetching for other stats (total revenue, total orders, customers, products sold)
    // if your backend has specific endpoints for these dashboard metrics.
    // E.g., this.http.get<number>(`${environment.apiUrl}/stats/revenue`).subscribe(...)
  }

  // Helper for status badge colors
  getStatusClass(status: string): string {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CONFIRMED':
        return 'bg-blue-100 text-blue-800';
      case 'SHIPPED':
      case 'OUT_FOR_DELIVERY': // Assuming this might be a status
        return 'bg-purple-100 text-purple-800';
      case 'DELIVERED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      case 'RETURNED': // Assuming this might be a status
        return 'bg-gray-200 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  // TrackBy for recent orders
  trackByOrder(index: number, order: OrderDto): number {
    return order.id;
  }
}
