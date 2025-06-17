import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { Category } from '../models/category.model';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private categoriesSignal = signal<Category[]>([]);
  private loadingSignal = signal<boolean>(false);
  private errorSignal = signal<string | null>(null);

  categories = this.categoriesSignal.asReadonly();
  isLoading = this.loadingSignal.asReadonly();
  error = this.errorSignal.asReadonly();

  constructor(private http: HttpClient) {}

  loadCategories(): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    this.http
      .get<Category[]>(`${environment.apiUrl}/categories`)
      .pipe(
        tap((categories) => {
          this.categoriesSignal.set(categories);
          this.loadingSignal.set(false);
        }),
        catchError((err) => {
          console.error('Failed to load categories:', err);
          this.errorSignal.set(
            'Failed to load categories. Please try again later.'
          );
          this.loadingSignal.set(false);
          return of([]);
        })
      )
      .subscribe();
  }
}
