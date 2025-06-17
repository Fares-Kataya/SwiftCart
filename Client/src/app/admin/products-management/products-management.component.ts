// src/app/admin/products-management/products-management.component.ts
import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import {
  CommonModule,
  CurrencyPipe,
  DatePipe,
  DecimalPipe,
} from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';

import {
  ProductService,
  ProductDto,
  PagedResult,
  CategoryDto,
} from '../../services/product.service';

@Component({
  selector: 'app-products-management',
  standalone: true,
  imports: [
    CommonModule,
    LucideAngularModule,
    FormsModule,
    CurrencyPipe,
    DatePipe,
    DecimalPipe,
  ],
  templateUrl: './products-management.component.html',
  styleUrls: ['./products-management.component.css'],
})
export class ProductsManagementComponent implements OnInit {
  products: WritableSignal<ProductDto[]> = signal([]);
  totalProducts: WritableSignal<number> = signal(0);
  allCategoryNames: WritableSignal<string[]> = signal([]);
  allCategories: WritableSignal<CategoryDto[]> = signal([]);

  // Pagination & Filters state
  currentPage: WritableSignal<number> = signal(1);
  pageSize: WritableSignal<number> = signal(12);
  searchQuery: WritableSignal<string> = signal('');
  selectedCategory: WritableSignal<string | null> = signal(null);
  sortBy: WritableSignal<string> = signal('newest');

  isLoading: WritableSignal<boolean> = signal(true);
  error: WritableSignal<string | null> = signal(null);

  // --- Add/Edit Product Form State ---
  isFormVisible: WritableSignal<boolean> = signal(false);
  currentProduct: WritableSignal<Partial<ProductDto>> = signal({});
  isSaving: WritableSignal<boolean> = signal(false);
  formError: WritableSignal<string | null> = signal(null);

  // --- Frontend ID Management (ULTRA-EXTREME DEMO HACK - DO NOT USE IN PRODUCTION) ---
  // THIS IS THE LEAST RELIABLE METHOD. IT IS HARDCODED AND WILL RESET ON BROWSER REFRESH.
  // It is only for a very specific, controlled demo where you manually ensure IDs don't conflict.
  lastProductId: WritableSignal<number> = signal(51); // <--- HARDCODED TO 51!

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    // You have loadProducts and loadCategories called here twice.
    // It's usually better to call them AFTER maxId is fetched if they depend on it.
    // Let's keep it as is for now as per your original code structure,
    // but the intention is that lastProductId is properly initialized *before*
    // any addProduct call happens.

    // This fetches the max ID from the backend initially
    this.productService.getMaxProductId().subscribe({
      next: (maxId) => {
        console.log('--- ngOnInit Debug ---');
        console.log('1. Backend Max ID Received:', maxId); // Log what the backend sent
        this.lastProductId.set(maxId);
        console.log('2. Frontend lastProductId after setting from backend:', this.lastProductId()); // Log frontend's updated lastProductId
        console.log('--- End ngOnInit Debug ---');

        // Now load categories and products, ensuring lastProductId is initialized
        this.loadCategories();
        this.loadProducts();
      },
      error: (err) => {
        console.error('Failed to fetch max product ID', err);
        // fallback to 0 so addProduct still works if max ID fetch fails
        this.lastProductId.set(0);
        console.log('Frontend lastProductId after error fallback:', this.lastProductId()); // Log fallback value
        this.loadCategories();
        this.loadProducts();
      },
    });
    // This `loadProducts()` call here might run before `lastProductId` is updated from the backend.
    // If your logic depends on it, you might want to move these inside the `subscribe`'s `next` block.
    this.loadProducts();
    this.loadCategories();
  }

  loadProducts(): void {
    // Moved the console.log from here. It was misleading here as this function
    // isn't directly related to the `addProduct` flow's immediate ID generation.
    // console.log('lastProductId before add:', this.lastProductId()); // REMOVED THIS LINE
    this.isLoading.set(true);
    this.error.set(null);

    const params = {
      page: this.currentPage(),
      size: this.pageSize(),
      search: this.searchQuery() || undefined,
      category: this.selectedCategory() || undefined,
      sort: this.sortBy() as 'priceAsc' | 'priceDesc' | 'newest',
    };

    this.productService.list(params).subscribe({
      next: (pagedResult: PagedResult<ProductDto>) => {
        this.products.set(pagedResult.items);
        this.totalProducts.set(pagedResult.total);
        if (pagedResult.categories) {
          this.allCategoryNames.set(pagedResult.categories);
        }
        this.isLoading.set(false);

        // --- Frontend DEMO HACK: Continue to update lastProductId with max ID seen on any loaded page ---
        // This ensures 'lastProductId' only ever increases based on observed data
        // from the current session, but it will reset to 51 on browser refresh.
        let pageMaxId = 0;
        for (const product of pagedResult.items) {
          if (product.id && product.id > pageMaxId) {
            pageMaxId = product.id;
          }
        }
        // Update lastProductId to be the maximum of its current value (which might be 51)
        // and the max on this page.
        this.lastProductId.update((currentMax) =>
          Math.max(currentMax, pageMaxId)
        );
        console.log('3. Frontend lastProductId after products loaded (page max update):', this.lastProductId()); // Log update from page data
        // --- END Frontend DEMO HACK ---
      },
      error: (err: HttpErrorResponse) => {
        console.error('Failed to fetch products:', err);
        this.error.set(
          'Failed to load products: ' + (err.message || err.statusText)
        );
        this.isLoading.set(false);
      },
    });
  }

  loadCategories(): void {
    this.productService.getCategories().subscribe({
      next: (categories: CategoryDto[]) => {
        this.allCategories.set(categories);
        this.allCategoryNames.set(categories.map((cat) => cat.name));
      },
      error: (err: HttpErrorResponse) => {
        console.error('Failed to load categories:', err);
      },
    });
  }

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages.length) {
      this.currentPage.set(page);
      this.loadProducts();
    }
  }

  onSearchChange(): void {
    this.currentPage.set(1);
    this.loadProducts();
  }

  onCategoryFilterChange(): void {
    this.currentPage.set(1);
    this.loadProducts();
  }

  onSortChange(): void {
    this.currentPage.set(1);
    this.loadProducts();
  }

  get totalPages(): number[] {
    return Array(Math.ceil(this.totalProducts() / this.pageSize()))
      .fill(0)
      .map((x, i) => i + 1);
  }

  // --- Add/Edit Product Methods ---

  addProduct(): void {
    console.log('--- Add Product Debug ---');
    console.log('4. lastProductId before generating newId:', this.lastProductId()); // Log value right before calculation
    const newId = this.lastProductId() + 1;
    console.log('5. Generated newId for product:', newId); // Log the calculated newId
    this.currentProduct.set({
      id: newId,
      title: '',
      description: '',
      price: 0,
      imageUrl: 'https://placehold.co/400x400?text=Product',
      categoryId: 0,
      categoryName: '',
      stock: 0,
      isNew: true,
    });
    this.formError.set(null);
    this.isFormVisible.set(true);
    console.log('--- End Add Product Debug ---');
  }

  editProduct(productId: number): void {
    this.isLoading.set(true);
    this.formError.set(null);

    this.productService.getProductById(productId).subscribe({
      next: (product: ProductDto) => {
        // --- DEMO HACK: Explicitly set isNew to false for existing products ---
        this.currentProduct.set({ ...product, isNew: false });
        // --- END DEMO HACK ---
        this.isLoading.set(false);
        this.isFormVisible.set(true);
      },
      error: (err: HttpErrorResponse) => {
        console.error('Failed to fetch product for edit:', err);
        this.error.set(
          'Failed to load product for editing: ' +
            (err.message || err.statusText)
        );
        this.isLoading.set(false);
      },
    });
  }

  saveProduct(): void {
    this.isSaving.set(true);
    this.formError.set(null);

    const productToSave = this.currentProduct();

    if (
      !productToSave.title ||
      !productToSave.description ||
      !productToSave.price ||
      !productToSave.categoryId ||
      !productToSave.imageUrl
    ) {
      this.formError.set(
        'Please fill in all required fields (Title, Description, Price, Image URL, Category).'
      );
      this.isSaving.set(false);
      return;
    }
    if (productToSave.categoryId === 0) {
      this.formError.set('Please select a valid category.');
      this.isSaving.set(false);
      return;
    }
    if (productToSave.stock === undefined || productToSave.stock < 0) {
      this.formError.set('Stock cannot be negative.');
      this.isSaving.set(false);
      return;
    }
    if (productToSave.price <= 0) {
      this.formError.set('Price must be greater than zero.');
      this.isSaving.set(false);
      return;
    }

    const selectedCat = this.allCategories().find(
      (cat) => cat.id === productToSave.categoryId
    );
    if (selectedCat) {
      productToSave.categoryName = selectedCat.name;
    } else {
      this.formError.set('Selected category is invalid.');
      this.isSaving.set(false);
      return;
    }

    // --- DEMO HACK: Use isNew flag to determine create vs. update ---
    if (!productToSave.isNew) {
      // Update existing product
      const updatePayload: Omit<
        ProductDto,
        'createdAt' | 'updatedAt' | 'rating' | 'reviewCount' | 'isNew'
      > = {
        id: productToSave.id!,
        title: productToSave.title!,
        description: productToSave.description!,
        price: productToSave.price!,
        imageUrl: productToSave.imageUrl!,
        categoryId: productToSave.categoryId!,
        categoryName: selectedCat.name, // Ensure categoryName is updated from selectedCat
        stock: productToSave.stock!,
      };

      this.productService
        .updateProduct(productToSave.id!, updatePayload)
        .subscribe({
          next: (updatedProduct: ProductDto) => {
            console.log('Product updated:', updatedProduct);
            this.isFormVisible.set(false);
            this.isSaving.set(false);
            this.loadProducts();
          },
          error: (err: HttpErrorResponse) => {
            console.error('Failed to update product:', err);
            this.formError.set(
              'Failed to update product: ' +
                (err.error?.message || err.message || err.statusText)
            );
            this.isSaving.set(false);
          },
        });
    } else {
      // Create new product with frontend-generated ID
      // Your backend MUST be configured to accept and use this ID on INSERT.
      // If your backend is configured for auto-increment (e.g., GenerationType.IDENTITY in JPA),
      // it might still ignore or reject this ID, potentially leading to new errors.
      const createPayload: ProductDto = {
        title: productToSave.title!,
        description: productToSave.description!,
        price: productToSave.price!,
        imageUrl: productToSave.imageUrl!,
        categoryId: productToSave.categoryId!,
        categoryName: selectedCat.name, // Ensure categoryName is set from selectedCat
        stock: productToSave.stock!,
        // Default values for fields not set by form but required by DTO
        createdAt: new Date().toISOString(), // Placeholder, backend should set this
        updatedAt: new Date().toISOString(), // Placeholder, backend should set this
        rating: 0,
        reviewCount: 0,
        isNew: true, // Keep this for consistency, though backend might ignore
      };

      this.productService.createProduct(createPayload).subscribe({
        next: (newProduct: ProductDto) => {
          console.log('Product created:', newProduct);
          this.isFormVisible.set(false);
          this.isSaving.set(false);
          // --- DEMO HACK: Update lastProductId with the new product's ID if it's higher ---
          if (newProduct.id && newProduct.id > this.lastProductId()) {
            this.lastProductId.set(newProduct.id);
          }
          // --- END DEMO HACK ---
          this.loadProducts();
        },
        error: (err: HttpErrorResponse) => {
          console.error('Failed to create product:', err);
          this.formError.set(
            'Failed to create product: ' +
              (err.error?.message || err.message || err.statusText)
          );
          this.isSaving.set(false);
        },
      });
    }
    // --- END DEMO HACK ---
  }

  cancelEdit(): void {
    this.isFormVisible.set(false);
    this.formError.set(null);
    this.currentProduct.set({});
  }

  deleteProduct(productId: number): void {
    if (!confirm(`Are you sure you want to delete Product ID ${productId}?`)) {
      return;
    }

    this.isLoading.set(true);
    this.productService.deleteProduct(productId).subscribe({
      next: () => {
        console.log(`Product ID ${productId} deleted successfully.`);
        this.loadProducts();
      },
      error: (err: HttpErrorResponse) => {
        console.error(`Failed to delete product ID ${productId}:`, err);
        this.error.set(
          'Failed to delete product: ' + (err.message || err.statusText)
        );
        this.isLoading.set(false);
      },
    });
  }

  trackByProduct(index: number, product: ProductDto): number | undefined {
    return product.id;
  }
}
