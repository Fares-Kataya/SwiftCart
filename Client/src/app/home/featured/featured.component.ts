import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { initFlowbite } from 'flowbite';
import {
  ProductService,
  Product as ServiceProduct,
} from '../../services/product.service'; // Alias Product from service

export interface Product {
  // Product interface for FeaturedComponent
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  rating: number;
  isNewArrival?: boolean;
  isBestSeller?: boolean;
  isOnSale?: boolean;
}

@Component({
  selector: 'app-featured',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './featured.component.html',
  styleUrl: './featured.component.css',
})
export class FeaturedComponent implements OnInit {
  products: Product[] = [];
  chunkedProducts: any[][] = [];
  errorMessage: string = '';

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.getFeaturedProducts();
  }

  ngAfterViewInit(): void {
    if (typeof initFlowbite === 'function') {
      initFlowbite();
    } else {
      console.warn(
        'Flowbite initialization function not found. Make sure Flowbite is correctly imported and available.'
      );
    }
  }
  chunkArray(arr: any[], chunkSize: number): any[][] {
    const result = [];
    for (let i = 0; i < arr.length; i += chunkSize) {
      result.push(arr.slice(i, i + chunkSize));
    }
    return result;
  }

  getFeaturedProducts(): void {
    this.productService
      .list({ page: 1, size: 10, onSale: true }) // Adjust page and size as needed
      .subscribe({
        next: (pagedResult) => {
          // Map the ServiceProduct to FeaturedComponent's Product interface
          this.products = pagedResult.items.map((item) => ({
            id: item.id,
            name: item.title,
            description: item.description,
            price: item.price,
            imageUrl: item.imageUrl,
            rating: item.rating || 0,
            isNewArrival: item.isNew,
            isOnSale: item.onSale,
            // isBestSeller might need specific backend logic or a different 'sort' parameter
          }));
          // --- Move chunking here, AFTER products are loaded ---
          this.chunkedProducts = this.chunkArray(this.products, 4);
          console.log('Products loaded and chunked:', this.chunkedProducts); // For debugging
        },
        error: (error) => {
          console.error('Error fetching featured products:', error);
          this.errorMessage =
            'Failed to load featured products. Please try again later.';
        },
      });
  }
}
