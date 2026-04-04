import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService } from './auth.service';

/**
 * Ruta Código QR: staff (escáner) o quien puede generar QR de hogar (USUARIO / admin con person_id).
 */
@Injectable({ providedIn: 'root' })
export class CodigoQrGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(): boolean | UrlTree {
    if (!this.auth.isAuthenticated()) {
      return this.router.parseUrl('/login');
    }
    if (this.auth.isStaff() || this.auth.canGenerateHouseAccessQr()) {
      return true;
    }
    return this.router.parseUrl('/');
  }
}
