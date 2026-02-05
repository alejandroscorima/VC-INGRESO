import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';
import { tap, map } from 'rxjs/operators';
import { Observable, BehaviorSubject } from 'rxjs';
import { User } from './user';

const STORAGE_KEY = 'auth_user';
const TOKEN_KEY = 'auth_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private baseUrl = environment.baseUrl;
  private userSubject = new BehaviorSubject<User | null>(this.initFromStorage());
  user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  private initFromStorage(): User | null {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as User;
    } catch {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
  }

  login(username: string, password: string): Observable<User> {
    return this.http.post<{ user: User; token: string } | { error: string }>(`${this.baseUrl}/getUser.php`, {
      username_system: username,
      password_system: password,
    }).pipe(
      map((res: any) => {
        if (res && !res.error && res.user && res.token) {
          return res as { user: User; token: string };
        }
        throw new Error(res?.error || 'Credenciales inválidas');
      }),
      tap((res) => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(res.user));
        localStorage.setItem(TOKEN_KEY, res.token);
        this.userSubject.next(res.user);
      })
    ).pipe(map((res) => res.user));
  }

  logout(): void {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(TOKEN_KEY);
    this.userSubject.next(null);
    this.router.navigate(['/login']);
  }

  getUser(): User | null {
    return this.userSubject.getValue();
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    return !!this.getUser();
  }

  // ========== Métodos Migrados de CookiesService ==========
  // Usan localStorage en lugar de cookies

  /**
   * Guarda un valor en localStorage
   */
  setItem(key: string, value: string): void {
    localStorage.setItem(key, value);
  }

  /**
   * Obtiene un valor de localStorage
   */
  getItem(key: string): string | null {
    return localStorage.getItem(key);
  }

  /**
   * Verifica si existe un valor en localStorage
   */
  hasItem(key: string): boolean {
    return localStorage.getItem(key) !== null;
  }

  /**
   * Elimina un valor de localStorage
   */
  removeItem(key: string): void {
    localStorage.removeItem(key);
  }

  // ========== Métodos Legacy (Alias para compatibilidad con CookiesService) ==========

  /**
   * Alias legacy para setItem - usa token_name como key
   */
  setToken(token_name: string, token: string): void {
    this.setItem(token_name, token);
  }

  /**
   * Alias legacy para getItem - usa token_name como key
   * Nota: Para el token de autenticación usar getToken() sin parámetros
   */
  getTokenItem(token_name: string): string {
    return this.getItem(token_name) || '';
  }

  /**
   * Alias legacy para hasItem
   */
  checkToken(token_name: string): boolean {
    return this.hasItem(token_name);
  }

  /**
   * Alias legacy para removeItem
   */
  deleteToken(token_name: string): void {
    this.removeItem(token_name);
  }
}
