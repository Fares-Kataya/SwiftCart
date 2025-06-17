import { Component, OnInit, inject, computed } from '@angular/core'; // Added 'computed'
import { LucideAngularModule } from 'lucide-angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CartService, CartProduct } from '../services/cart.service'; // Import CartService and CartProduct

@Component({
  selector: 'app-shopping-cart',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css'],
})
export class ShoppingCartComponent implements OnInit {
  cartService = inject(CartService);

  promoCode: string = '';
  promoApplied: boolean = false;

  // Define computed properties for all totals
  subtotal = computed(() => {
    return this.cartService.cartItems().reduce((sum, item) => {
      // Assuming item.inStock is handled within CartService or product data itself
      return sum + (item.price * item.quantity); // Use item.price and item.quantity directly from CartProduct
    }, 0);
  });

  discount = computed(() => {
    return this.promoApplied ? this.subtotal() * 0.1 : 0;
  });

  shipping = computed(() => {
    // Check subtotal() - discount() for free shipping logic
    return this.subtotal() - this.discount() >= 100 ? 0 : 7.99;
  });

  tax = computed(() => {
    // Calculate tax based on subtotal() - discount()
    return (this.subtotal() - this.discount()) * 0.05;
  });

  total = computed(() => {
    const calculatedTotal = this.subtotal() - this.discount() + this.shipping() + this.tax();
    return Math.max(0, calculatedTotal); // Ensure total doesn't go below zero
  });


  ngOnInit(): void {
    // ngOnInit is now simpler as computations are handled by signals
    // The cartService handles loading from storage and provides the real data.
  }

  /**
   * Updates the quantity of a specific item in the cart.
   * Delegates directly to the CartService's updateQuantity method.
   * @param itemId The ID of the item to update.
   * @param newQuantity The new quantity for the item.
   */
  updateQuantity(itemId: number, newQuantity: number | string): void {
    const quantity = typeof newQuantity === 'string' ? parseInt(newQuantity, 10) : newQuantity;

    // Delegate the update logic to the CartService
    this.cartService.updateQuantity(itemId, quantity);
    // The computed properties (subtotal, total, etc.) will automatically re-evaluate
    // when cartService.cartItems() signal changes.
  }

  /**
   * Removes an item from the cart.
   * Delegates directly to the CartService's removeItem method.
   * @param itemId The ID of the item to remove.
   */
  removeItem(itemId: number): void {
    // Delegate the remove logic to the CartService
    this.cartService.removeItem(itemId);
    // The computed properties will automatically re-evaluate.
  }

  /**
   * Applies a promo code if it's valid.
   */
  applyPromo(): void {
    if (this.promoCode.toUpperCase() === 'SAVE10' && !this.promoApplied) {
      this.promoApplied = true;
      // No need to call calculateTotals manually, promoApplied is a signal dependency
    } else {
      console.log('Invalid or already applied promo code.');
    }
  }

  // Helper for ngFor trackBy
  // Using CartProduct for type consistency with cartService.cartItems()
  trackByCartItem(index: number, item: CartProduct): number {
    return item.id;
  }
}
