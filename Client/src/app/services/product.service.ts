import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  rating?: number; // <--- These two properties are crucial
  reviewCount?: number; // <---
  isNew?: boolean;
}

export interface ListParams {
  page: number;
  size: number;
  search?: string;
  category?: string;
  categories?: string[];
  sort?: 'priceAsc' | 'priceDesc' | 'newest';
  minPrice?: number;
  maxPrice?: number;
  maxRating?: number;
  inStock?: boolean;
  onSale?: boolean;
}

export interface PagedResult<T> {
  items: T[];
  total: number;
  categories?: string[];
}
export interface ProductDto {
  id?: number;
  title: string;
  description: string;
  price: number;
  categoryId: number;
  categoryName: string; // This property is present in backend ProductDto
  imageUrl: string;
  stock: number;
  rating?: number;
  reviewCount?: number;
  isNew?: boolean;
  createdAt?: string; // Instant from Java usually maps to string (ISO 8601)
  updatedAt?: string; // Instant from Java usually maps to string (ISO 8601)
}

// Interface matching your backend CategoryDto
export interface CategoryDto {
  id?: number;
  name: string;
  imageUrl?: string;
  parentId?: number;
  children?: CategoryDto[];
}

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private readonly apiUrl = 'http://localhost:8081/api/products';
  private readonly categoriesApiUrl = 'http://localhost:8081/api/categories';

  constructor(private http: HttpClient) {}

  list(params: ListParams) {
    let httpParams = new HttpParams()
      .set('page', params.page)
      .set('size', params.size);

    if (params.search) httpParams = httpParams.set('search', params.search);
    if (params.category)
      httpParams = httpParams.set('category', params.category);
    if (params.categories)
      httpParams = httpParams.set('categories', params.categories.join(','));
    if (params.sort) httpParams = httpParams.set('sort', params.sort);
    if (params.minPrice != null)
      httpParams = httpParams.set('minPrice', String(params.minPrice));
    if (params.maxPrice != null)
      httpParams = httpParams.set('maxPrice', String(params.maxPrice));
    if (params.maxRating != null)
      httpParams = httpParams.set('maxRating', String(params.maxRating));
    if (params.inStock != null)
      httpParams = httpParams.set('inStock', String(params.inStock));
    if (params.onSale != null)
      httpParams = httpParams.set('onSale', String(params.onSale));

    return this.http.get<PagedResult<any>>(this.apiUrl, { params: httpParams });
  }
  getProductById(id: number): Observable<ProductDto> {
    return this.http.get<ProductDto>(`${this.apiUrl}/${id}`);
  }

  // Create a new product
  // Note: Backend expects ProductDto, and usually 'id' is not sent for creation
  createProduct(
    product: Omit<
      ProductDto,
      'id' | 'createdAt' | 'updatedAt' | 'rating' | 'reviewCount' | 'isNew'
    >
  ): Observable<ProductDto> {
    return this.http.post<ProductDto>(this.apiUrl, product);
  }

  // Update an existing product
  // Note: Backend expects ProductDto with 'id' in path, and usually 'createdAt', 'updatedAt' are not sent
  updateProduct(
    id: number,
    product: Omit<
      ProductDto,
      'createdAt' | 'updatedAt' | 'rating' | 'reviewCount' | 'isNew'
    >
  ): Observable<ProductDto> {
    return this.http.put<ProductDto>(`${this.apiUrl}/${id}`, product);
  }

  // Delete a product
  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Fetch all root categories
  getCategories(): Observable<CategoryDto[]> {
    return this.http.get<CategoryDto[]>(this.categoriesApiUrl);
  }
  getMaxProductId(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/max-id`);
  }
}
