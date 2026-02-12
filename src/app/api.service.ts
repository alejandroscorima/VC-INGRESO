import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../environments/environment';

/**
 * Interfaz base para respuestas de la API
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

/**
 * ApiService - Servicio unificado para todas las llamadas HTTP
 * 
 * Proporciona métodos tipados para GET, POST, PUT, DELETE con:
 * - Manejo centralizado de errores
 * - Tipado de respuestas
 * - Parámetros via HttpParams
 */
@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = environment.baseUrl;

  constructor(private http: HttpClient) {}

  /**
   * Realiza una petición GET con parámetros tipados
   */
  get<T>(endpoint: string, params?: Record<string, string | number | boolean>): Observable<ApiResponse<T>> {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        httpParams = httpParams.set(key, String(value));
      });
    }

    return this.http.get<ApiResponse<T>>(`${this.baseUrl}/${endpoint}`, { params: httpParams }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Realiza una petición GET sin tipado (para endpoints legacy)
   */
  getRaw(endpoint: string, params?: Record<string, string | number | boolean>): Observable<any> {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        httpParams = httpParams.set(key, String(value));
      });
    }

    return this.http.get(`${this.baseUrl}/${endpoint}`, { params: httpParams }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Realiza una petición POST con datos tipados
   */
  post<T>(endpoint: string, data: T): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/${endpoint}`, data).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Realiza una petición PUT con datos tipados
   */
  put<T>(endpoint: string, data: T): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.baseUrl}/${endpoint}`, data).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Realiza una petición DELETE
   */
  delete(endpoint: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.baseUrl}/${endpoint}`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Subir foto de perfil del usuario autenticado (POST multipart).
   * Requiere token. Devuelve { success, data: usuario actualizado }.
   */
  uploadProfilePhoto(file: File): Observable<ApiResponse<any>> {
    const form = new FormData();
    form.append('photo', file);
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/api/v1/users/me/photo`, form).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Devuelve la URL completa para mostrar una foto (vehículo, mascota, perfil, etc.).
   * Si la URL ya es absoluta (http/https), la devuelve tal cual; si es ruta relativa (ej. /uploads/...), le antepone la baseUrl del API.
   */
  getPhotoUrl(url: string | null | undefined): string | null {
    if (!url || typeof url !== 'string') return null;
    const u = url.trim();
    if (u.startsWith('http://') || u.startsWith('https://')) return u;
    const base = this.baseUrl.replace(/\/$/, '');
    return u.startsWith('/') ? `${base}${u}` : `${base}/${u}`;
  }

  /**
   * Manejo centralizado de errores
   */
  private handleError(error: any): Observable<never> {
    let errorMessage = 'Error desconocido';

    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else if (error.status) {
      // Error del lado del servidor
      switch (error.status) {
        case 400:
          errorMessage = error.error?.error || 'Solicitud incorrecta';
          break;
        case 401:
          errorMessage = 'No autorizado. Por favor inicie sesion nuevamente.';
          break;
        case 403:
          errorMessage = 'Acceso prohibido';
          break;
        case 404:
          errorMessage = 'Recurso no encontrado';
          break;
        case 409:
          errorMessage = error.error?.error || 'Conflicto de datos';
          break;
        case 500:
          errorMessage = 'Error interno del servidor';
          break;
        default:
          errorMessage = `Error ${error.status}: ${error.message}`;
      }
    }

    console.error('ApiService Error:', errorMessage, error);
    return throwError(() => new Error(errorMessage));
  }
}
