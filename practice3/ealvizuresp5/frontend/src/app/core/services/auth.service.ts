import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { AuthResponse, User } from '../models/auth.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'auth_user';
  private readonly apiUrl = `${environment.apiUrl}/auth`;

  private currentUserSignal = signal<User | null>(this.restoreSession());

  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly isAuthenticated = computed(() => !!this.currentUserSignal());
  readonly role = computed(() => this.currentUserSignal()?.role);
  
  readonly isAdmin = computed(() => this.role() === 'Admin');
  readonly canManageProducts = computed(() => this.isAdmin() || this.role() === 'Manager');
  readonly canDeleteProducts = computed(() => this.isAdmin());

  constructor(private http: HttpClient, private router: Router) {}

  login(credentials: { email: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap((res) => {
        localStorage.setItem(this.TOKEN_KEY, res.token);
        const user: User = { name: res.name, email: res.email, role: res.role };
        localStorage.setItem(this.USER_KEY, JSON.stringify(user));
        this.currentUserSignal.set(user);
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUserSignal.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    const token = localStorage.getItem(this.TOKEN_KEY)?.trim() || null;
    if (!token || !this.isTokenValid(token)) {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
      return null;
    }
    return token;
  }

  hasAnyRole(allowedRoles: string[]): boolean {
    const currentRole = this.role();
    return !!currentRole && allowedRoles.includes(currentRole);
  }

  private restoreSession(): User | null {
    if (!this.getToken()) return null;

    const data = localStorage.getItem(this.USER_KEY);
    if (!data) return null;

    try {
      return JSON.parse(data) as User;
    } catch {
      localStorage.removeItem(this.USER_KEY);
      return null;
    }
  }

  private isTokenValid(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
      return typeof payload.exp === 'number' && payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }
}
