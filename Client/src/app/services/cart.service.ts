import { Injectable, signal, computed, WritableSignal } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
// Define a minimal interface for cart items
export interface CartProduct {
  // Exported for use in NavbarComponent
  id: number;
  title: string;
  imageUrl: string;
  price: number;
  quantity: number;
  color?: string; // Added optional color property
  size?: string;
  maxQuantity?: number; // Added to support quantity limits (optional)
  inStock?: boolean; // Added to support stock status (optional)
}

@Injectable({
  providedIn: 'root', // Makes the service a singleton available throughout the app
})
export class CartService {
  // Using Angular signals for reactive state management
  cartItems: WritableSignal<CartProduct[]> = signal([]); // Explicitly WritableSignal
  cartTotal = signal<number>(0);
  cartItemCount = signal<number>(0);

  // For toast and loading (can be moved to a separate UI service if app grows)
  showToast = signal<boolean>(false);
  toastMessage = signal<string>('');
  isLoading = signal<boolean>(false);

  constructor() {
    // Optionally load cart from local storage or backend on service initialization
    this.loadCartFromStorage();
  }

  // Method to add a product to the cart
  async addToCart(product: Omit<CartProduct, 'quantity'>) {
    this.isLoading.set(true);
    this.showToast.set(false); // Hide any existing toast

    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      this.cartItems.update((items) => {
        const existingItemIndex = items.findIndex(
          (item) => item.id === product.id
        );
        if (existingItemIndex > -1) {
          // If product exists, increment quantity, respecting maxQuantity if present
          const currentItem = items[existingItemIndex];
          if (currentItem.inStock === false) {
            // Do not increment if out of stock
            this.toastMessage.set(`${product.title} is out of stock.`);
            this.showToast.set(true);
            return items; // Don't modify quantity
          }
          const newQuantity = currentItem.quantity + 1;
          items[existingItemIndex].quantity =
            currentItem.maxQuantity !== undefined
              ? Math.min(newQuantity, currentItem.maxQuantity)
              : newQuantity;
        } else {
          // If new product, add with quantity 1
          items.push({
            ...product,
            quantity: 1,
            inStock: product.inStock !== false,
            maxQuantity: product.maxQuantity,
          }); // Carry over inStock/maxQuantity
        }
        return [...items]; // Return a new array reference to trigger signal update
      });

      this.updateCartSummary();
      this.toastMessage.set(`${product.title} added to cart!`);
      this.showToast.set(true);

      // Hide toast after 3 seconds
      setTimeout(() => {
        this.showToast.set(false);
      }, 3000);

      this.saveCartToStorage(); // Save updated cart to storage
    } catch (error) {
      this.toastMessage.set('Failed to add product to cart.');
      this.showToast.set(true);
      console.error('Add to cart error:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Updates the quantity of a specific item in the cart.
   * Handles minimum (1) and maximum (item.maxQuantity) quantity constraints.
   * If newQuantity is 0 or less, the item is removed.
   * @param productId The ID of the item to update.
   * @param newQuantity The new quantity for the item.
   */
  updateQuantity(productId: number, newQuantity: number): void {
    this.cartItems.update((items) => {
      const itemIndex = items.findIndex((item) => item.id === productId);

      if (itemIndex > -1) {
        const item = items[itemIndex];

        if (newQuantity <= 0) {
          // Remove item if quantity is 0 or less
          this.toastMessage.set(`${item.title} removed from cart.`);
          this.showToast.set(true);
          setTimeout(() => {
            this.showToast.set(false);
          }, 3000);
          return items.filter((i) => i.id !== productId);
        }

        if (item.inStock === false) {
          // Do not update quantity if out of stock
          this.toastMessage.set(
            `${item.title} is out of stock and cannot be updated.`
          );
          this.showToast.set(true);
          return items;
        }

        // Apply maxQuantity constraint if defined
        const finalQuantity =
          item.maxQuantity !== undefined
            ? Math.min(newQuantity, item.maxQuantity)
            : newQuantity;

        if (finalQuantity !== item.quantity) {
          items[itemIndex] = { ...item, quantity: finalQuantity };
          this.toastMessage.set(
            `${item.title} quantity updated to ${finalQuantity}.`
          );
          this.showToast.set(true);
          setTimeout(() => {
            this.showToast.set(false);
          }, 3000);
        } else if (
          newQuantity > item.quantity &&
          item.maxQuantity !== undefined &&
          finalQuantity === item.maxQuantity
        ) {
          // Inform user if max quantity was reached
          this.toastMessage.set(
            `Maximum quantity (${item.maxQuantity}) reached for ${item.title}.`
          );
          this.showToast.set(true);
          setTimeout(() => {
            this.showToast.set(false);
          }, 3000);
        }
      }
      this.updateCartSummary(); // Ensure summary is updated after any quantity change
      this.saveCartToStorage();
      return [...items]; // Return a new array reference to trigger signal update
    });
  }

  // Method to remove a product from the cart by its ID
  // Renamed to 'removeItem' for consistency with component's call
  removeItem(productId: number) {
    this.cartItems.update((items) =>
      items.filter((item) => item.id !== productId)
    );
    this.updateCartSummary();
    this.toastMessage.set('Item removed from cart.');
    this.showToast.set(true);
    setTimeout(() => {
      this.showToast.set(false);
    }, 3000);
    this.saveCartToStorage(); // Save updated cart to storage
  }

  // Helper to update the total count and price
  private updateCartSummary() {
    const count = this.cartItems().reduce(
      (sum, item) => sum + item.quantity,
      0
    );
    const total = this.cartItems().reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    this.cartItemCount.set(count);
    this.cartTotal.set(total);
  }

  // Save cart to local storage (for persistence across sessions)
  private saveCartToStorage() {
    localStorage.setItem('swiftcart_items', JSON.stringify(this.cartItems()));
  }

  // Load cart from local storage
  private loadCartFromStorage() {
    const storedItems = localStorage.getItem('swiftcart_items');
    if (storedItems) {
      try {
        this.cartItems.set(JSON.parse(storedItems));
        this.updateCartSummary();
      } catch (e) {
        console.error('Error parsing stored cart items:', e);
        localStorage.removeItem('swiftcart_items'); // Clear corrupted data
      }
    }
  }

  // Optional: clear the entire cart
  clearCart() {
    this.cartItems.set([]);
    this.updateCartSummary();
    this.saveCartToStorage();
    this.toastMessage.set('Cart cleared!');
    this.showToast.set(true);
    setTimeout(() => {
      this.showToast.set(false);
    }, 3000);
  }
}
