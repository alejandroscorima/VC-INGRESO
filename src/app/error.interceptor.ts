import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

/**
 * ErrorInterceptor - Manejo centralizado de errores HTTP
 * 
 * Captura todos los errores de las peticiones HTTP y:
 * - Registra el error en consola
 * - Redirige a página de error en caso de 500
 * - Maneja errores 401 (no autorizado)
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'Error desconocido';

      if (error.error instanceof ErrorEvent) {
        // Error del lado del cliente
        errorMessage = `Error: ${error.error.message}`;
      } else {
        // Error del lado del servidor
        switch (error.status) {
          case 400:
            errorMessage = error.error?.error || 'Solicitud incorrecta';
            break;
          case 401:
            errorMessage = 'No autorizado';
            // Redirigir a login si no está autenticado
            localStorage.removeItem('auth_user');
            localStorage.removeItem('auth_token');
            router.navigate(['/login']);
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
            // No redirigir a /error (no existe la ruta); el componente puede mostrar toast/mensaje
            break;
          default:
            errorMessage = `Error ${error.status}: ${error.message}`;
        }
      }

      console.error('HTTP Error:', {
        url: req.url,
        status: error.status,
        message: errorMessage,
        error: error.error
      });

      return throwError(() => new Error(errorMessage));
    })
  );
};
