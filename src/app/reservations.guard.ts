import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService } from './auth.service';
import { ToastrService } from 'ngx-toastr';

@Injectable({ providedIn: 'root' })
export class ReservationsGuard implements CanActivate {
  constructor(
    private auth: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  canActivate(): boolean | UrlTree {
    if (!this.auth.isAuthenticated()) {
      return this.router.parseUrl('/login');
    }
    if (!this.auth.canAccessReservationsPage()) {
      this.toastr.warning('No tienes acceso a reservaciones con tu rol y perfil.');
      return this.router.parseUrl('/');
    }
    return true;
  }
}
