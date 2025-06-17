import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxSliderModule } from '@angular-slider/ngx-slider';
import {
  ProductService,
  ListParams,
  PagedResult,
  Product as APIProduct,
} from '../services/product.service';
// import { Output, EventEmitter } from '@angular/core'; // Removed, no longer needed
import { CartService } from '../services/cart.service'; // Keep this import

interface Product extends APIProduct {
  // id: number;
  // title: string;
  // description: string;
  // price: number;
  // image_url: string;
  stock: number;
  // created_at: string;
  // updated_at: string;
  // category_id: number;
  isNew?: boolean;
  // rating?: number;/
  reviewCount?: number;
}

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxSliderModule],
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css'],
})
export class ProductsComponent implements OnInit {
  // @Output() addToCartClick = new EventEmitter<Product>(); // REMOVED: No longer needed for direct parent-child communication
  products: Product[] = [];
  total = 0;
  categories: string[] = [];
  public Math = Math;
  // search + sort + pagination
  search = '';
  sort: 'priceAsc' | 'priceDesc' | 'newest' | null = null;
  page = 1;
  size = 12;

  // composite filter state
  filterState = {
    selectedCategories: {} as Record<string, boolean>,
    minPrice: 0,
    maxPrice: 1000,
    selectedRatings: {} as Record<number, boolean>,
    inStockOnly: false,
    onSaleOnly: false,
  };

  // Inject CartService here
  constructor(
    private productService: ProductService,
    public cartService: CartService
  ) {} // Made cartService public for direct use in template

  ngOnInit() {
    // fetch categories + initialize filterState
    this.productService.list({ page: 1, size: 1 }).subscribe((res) => {
      this.categories = res.categories ?? [];
      this.categories.forEach(
        (c) => (this.filterState.selectedCategories[c] = false)
      );
      [5, 4, 3, 2, 1].forEach(
        (r) => (this.filterState.selectedRatings[r] = false)
      );
      this.loadProducts();
    });
  }

  /** trackBy for *ngFor */
  trackById(_: number, p: Product) {
    return p.id;
  }

  /** Clear everything back to defaults */
  clearAllFilters() {
    Object.keys(this.filterState.selectedCategories).forEach(
      (c) => (this.filterState.selectedCategories[c] = false)
    );
    Object.keys(this.filterState.selectedRatings).forEach(
      (r) => (this.filterState.selectedRatings[+r] = false)
    );
    this.filterState.minPrice = 0;
    this.filterState.maxPrice = 1000;
    this.filterState.inStockOnly = false;
    this.filterState.onSaleOnly = false;
    this.page = 1;
    this.loadProducts();
  }

  /** Apply the selected filters */
  onApplyFilters() {
    this.page = 1;
    this.loadProducts();
  }

  /** Search input changed */
  onSearchChange(q: string) {
    this.search = q;
    this.page = 1;
    this.loadProducts();
  }

  /** Sort dropdown changed */
  onSortChange(s: string) {
    this.sort = (s as any) || null;
    this.page = 1;
    this.loadProducts();
  }

  /** Jump to page `n` */
  goToPage(n: number) {
    this.page = n;
    this.loadProducts();
  }

  /** Total pages for pagination */
  get totalPages(): number {
    return this.total > 0 ? Math.ceil(this.total / this.size) : 1;
  }

  /** Core loader—called by every filter/sort/pagination change */
  private loadProducts() {
    const cats = Object.entries(this.filterState.selectedCategories)
      .filter(([, v]) => v)
      .map(([k]) => k);

      const selectedRatings = Object.entries(this.filterState.selectedRatings)
      .filter(([, v]) => v)
      .map(([k]) => +k);

    let maxRating: number | undefined = undefined;
    if (selectedRatings.length > 0) {
      maxRating = Math.min(...selectedRatings);
    }

    const params: ListParams = {
      page: this.page,
      size: this.size,
      search: this.search || undefined,
      sort: this.sort || undefined,
      categories: cats.length ? cats : undefined,
      minPrice: this.filterState.minPrice,
      maxPrice: this.filterState.maxPrice,
      maxRating: maxRating,
      inStock: this.filterState.inStockOnly || undefined,
      onSale: this.filterState.onSaleOnly || undefined,
    };

    this.productService.list(params).subscribe((res: PagedResult<Product>) => {
      this.products = res.items;
      this.total = res.total;
    });
  }
}
