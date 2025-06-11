import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, map, catchError, of } from 'rxjs';
import { environment } from '../../environments/environment';

export interface RegisterPayload {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  gender?: string;
  phone?: string;
  image?: string;
}
export interface UserProfile {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  gender?: string;
  phone?: string;
  image?: string;
  role?: string;
}
export interface UserProfileUpdatePayload {
  firstName?: string;
  lastName?: string;
  email?: string;
  gender?: string;
  phone?: string;
  image?: string;
}

export interface UserPasswordUpdatePayload {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}
export interface LoginPayload {
  email: string;
  password: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'jwt';
  private tokenSub = new BehaviorSubject<string | null>(
    localStorage.getItem(this.TOKEN_KEY)
  );
  public token$ = this.tokenSub.asObservable();
  constructor(private http: HttpClient) {}

  register(data: RegisterPayload): Observable<void> {
    return this.http.post<void>(`${environment.apiUrl}/auth/register`, data);
  }

  login(data: LoginPayload): Observable<void> {
    return this.http
      .post(`${environment.apiUrl}/auth/login`, data, { responseType: 'text' })
      .pipe(
        tap((token: string) => {
          localStorage.setItem(this.TOKEN_KEY, token);
          this.tokenSub.next(token);
        }),
        map(() => void 0)
      );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    this.tokenSub.next(null);
  }

  get token(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }
  isLoggedIn(): boolean {
    return !!this.token;
  }
  me(): Observable<UserProfile | null> {
    return this.http
      .get<UserProfile>(`${environment.apiUrl}/users/me`)
      .pipe(catchError(() => of(null)));
  }
  updateProfile(changes: Partial<UserProfile>): Observable<UserProfile> {
    return this.http.put<UserProfile>(
      `${environment.apiUrl}/users/me`,
      changes
    );
  }
  updatePassword(payload: {
    currentPassword: string;
    newPassword: string;
  }): Observable<void> {
    return this.http.post<void>(
      `${environment.apiUrl}/users/me/password`,
      payload
    );
  }
}
