// checkout.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { LucideAngularModule } from 'lucide-angular';
import { CartService, CartProduct } from '../services/cart.service'; // Import CartService and CartProduct interface
import { environment } from '../../environments/environment'; // Import the environment file

interface Address {
  firstName: string;
  lastName: string;
  address: string;
  apartment?: string;
  city: string;
  state: string;
  zipCode: string;
}

// Define the interfaces that match your backend DTOs for type safety
interface OrderItemDto {
  productId: number;
  quantity: number;
  unitPrice: number; // Use number for BigDecimal in TypeScript for simplicity in frontend
}

interface OrderDto {
  items: OrderItemDto[];
  totalPrice: number; // Use number for BigDecimal in TypeScript
}

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    LucideAngularModule,
    HttpClientModule, // Add HttpClientModule to imports
  ],
  providers: [CartService], // <--- Ensure CartService is provided here
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css'],
})
export class CheckoutComponent implements OnInit, OnDestroy {
  // Use CartProduct interface for cart items
  cartItems: CartProduct[] = [];

  email: string = '';
  phone: string = '';

  shippingAddress: Address = {
    firstName: '',
    lastName: '',
    address: '',
    apartment: '',
    city: '',
    state: '',
    zipCode: '',
  };

  sameAsShipping: boolean = true;
  billingAddress: Address = {
    firstName: '',
    lastName: '',
    address: '',
    apartment: '',
    city: '',
    state: '',
    zipCode: '',
  };

  paymentMethod: string = 'card';

  cardDetails = {
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardName: '',
  };

  shippingMethod: string = 'standard';

  subtotal: number = 0;
  shipping: number = 0;
  tax: number = 0;
  total: number = 0;

  constructor(
    public cartService: CartService,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit() {
    this.cartItems = this.cartService.cartItems();
    this.calculateOrderSummary();
  }

  ngOnDestroy(): void {
    // No specific cleanup needed here
  }

  calculateOrderSummary() {
    this.subtotal = this.cartService
      .cartItems()
      .reduce(
        (sum: number, item: CartProduct) => sum + item.price * item.quantity,
        0
      );
    this.shipping = this.getShippingCost(this.shippingMethod);
    this.tax = this.subtotal * 0.08;
    this.total = this.subtotal + this.shipping + this.tax;
  }

  private getShippingCost(method: string): number {
    switch (method) {
      case 'express':
        return 15.99;
      case 'overnight':
        return 29.99;
      case 'standard':
      default:
        return 5.99;
    }
  }

  onShippingMethodChange(method: string) {
    this.shippingMethod = method;
    this.calculateOrderSummary();
  }

  onPaymentMethodChange(method: string) {
    this.paymentMethod = method;
  }

  onSameAsShippingChange(checked: boolean) {
    this.sameAsShipping = checked;
    if (this.sameAsShipping) {
      this.billingAddress = { ...this.shippingAddress }; // Deep copy
    } else {
      this.billingAddress = {
        firstName: '',
        lastName: '',
        address: '',
        apartment: '',
        city: '',
        state: '',
        zipCode: '',
      };
    }
  }

  handleSubmit() {
    // Map CartProduct to OrderItemDto as required by the backend
    const orderItemsDto: OrderItemDto[] = this.cartService
      .cartItems()
      .map((item) => ({
        productId: item.id, // Assuming CartProduct.id maps to OrderItemDto.productId
        quantity: item.quantity,
        unitPrice: item.price, // Assuming CartProduct.price maps to OrderItemDto.unitPrice
      }));

    // Construct the OrderDto object
    const orderDto: OrderDto = {
      items: orderItemsDto,
      // The backend's OrderService recalculates totalPrice from items.
      // So, send the subtotal here, which is the sum of (unitPrice * quantity)
      totalPrice: this.subtotal,
    };

    console.log('Sending OrderDto to backend:', orderDto);

    // Construct the backend URL using the environment variable
    const backendUrl = `${environment.apiUrl}/orders`; // Use environment.apiUrl

    this.http.post<any>(backendUrl, orderDto).subscribe({
      next: (response) => {
        console.log('Order placed successfully:', response);
        this.cartService.clearCart(); // Clear the cart after successful order placement
        this.router.navigate(['/thank-you']); // Navigate to the thank you page
      },
      error: (error) => {
        console.error('Order placement failed:', error);
        // Attempt to get a more specific error message from the backend response
        const errorMessage =
          error.error?.message || error.message || 'An unknown error occurred.';
        alert(
          `Failed to place order. Please try again. Error: ${errorMessage}`
        );
      },
    });
  }

  trackByCartItem(index: number, item: CartProduct): number {
    return item.id;
  }
}
