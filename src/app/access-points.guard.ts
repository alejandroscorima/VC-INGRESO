import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService } from './auth.service';
import { ToastrService } from 'ngx-toastr';

/** Puntos de acceso: solo administrador (gestión global). */
@Injectable({ providedIn: 'root' })
export class AccessPointsGuard implements CanActivate {
  constructor(
    private auth: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  canActivate(): boolean | UrlTree {
    if (!this.auth.isAuthenticated()) {
      return this.router.parseUrl('/login');
    }
    if (!this.auth.isAdministratorRole()) {
      this.toastr.warning('Solo administradores pueden gestionar puntos de acceso.');
      return this.router.parseUrl('/');
    }
    return true;
  }
}
