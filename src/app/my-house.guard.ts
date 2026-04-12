import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService } from './auth.service';
import { ToastrService } from 'ngx-toastr';

/**
 * Mi casa: USUARIO / ADMINISTRADOR / OPERARIO con persona PROPIETARIO, RESIDENTE o INQUILINO
 * y con house_id asignado (staff que también vive en el barrio).
 */
@Injectable({ providedIn: 'root' })
export class MyHouseGuard implements CanActivate {
  constructor(
    private auth: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  canActivate(): boolean | UrlTree {
    if (!this.auth.isAuthenticated()) {
      return this.router.parseUrl('/login');
    }
    const u = this.auth.getUser();
    if (!u) {
      return this.router.parseUrl('/login');
    }
    const role = (u.role_system || '').trim().toUpperCase();
    const allowedRoles = ['USUARIO', 'ADMINISTRADOR', 'OPERARIO'];
    if (!allowedRoles.includes(role)) {
      this.toastr.warning('No tienes acceso a Mi casa.');
      return this.router.parseUrl('/');
    }
    const pt = (u.property_category || u.person_type || '').trim().toUpperCase();
    const allowedTypes = ['PROPIETARIO', 'RESIDENTE', 'INQUILINO'];
    if (!this.auth.isSessionRolePersonValid()) {
      this.toastr.warning('Tu perfil no permite acceder a Mi casa.');
      return this.router.parseUrl('/');
    }
    if (!allowedTypes.includes(pt)) {
      this.toastr.warning('Mi casa solo está disponible para propietarios, residentes o inquilinos con acceso al sistema.');
      return this.router.parseUrl('/');
    }
    const hid = Number(u.house_id) || 0;
    if (hid <= 0) {
      this.toastr.warning('Necesitas una casa asignada para usar Mi casa.');
      return this.router.parseUrl('/');
    }
    return true;
  }
}
