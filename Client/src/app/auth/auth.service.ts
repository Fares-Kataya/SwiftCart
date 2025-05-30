import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

interface RegisterPayload { firstName:string; lastName:string; username:string; email:string; password:string; gender?:string; image?:string; }
interface LoginPayload { email:string; password:string; }

@Injectable({ providedIn: 'root' })
export class AuthService {
  private base = 'http://localhost:8081/api/auth';
  constructor(private http: HttpClient) {}

  register(data: RegisterPayload): Observable<void> {
    return this.http.post<void>(`${this.base}/register`, data);
  }

  login(data: LoginPayload): Observable<{token:string}> {
    return this.http.post<{token:string}>(`${this.base}/login`, data)
      .pipe(tap(r => localStorage.setItem('jwt', r.token)));
  }

  logout() {
    localStorage.removeItem('jwt');
  }

  get token(): string | null {
    return localStorage.getItem('jwt');
  }
}
