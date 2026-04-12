import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppComponent } from '../app.component';
import { AuthService } from '../auth.service';
import { ApiService } from '../api.service';
import { UsersService } from '../users.service';
import { EntranceService } from '../entrance.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-side-nav',
  templateUrl: './side-nav.component.html',
  styleUrls: ['./side-nav.component.css']
})
export class SideNavComponent extends AppComponent implements OnInit {
  uploadingPhoto = false;

  constructor(
    router: Router,
    auth: AuthService,
    usersService: UsersService,
    entranceService: EntranceService,
    toastr: ToastrService,
    api: ApiService
  ) {
    super(router, auth, usersService, entranceService, toastr, api);
  }

  onProfilePhotoClick(): void {
    const el = document.getElementById('profile-photo-input') as HTMLInputElement;
    if (el) el.click();
  }

  onProfilePhotoChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input?.files?.[0];
    if (!file || !file.type.startsWith('image/')) {
      this.toastr.warning('Seleccione una imagen (JPG, PNG o GIF).');
      input.value = '';
      return;
    }
    this.uploadingPhoto = true;
    this.api.uploadProfilePhoto(file).subscribe({
      next: (res: any) => {
        this.uploadingPhoto = false;
        input.value = '';
        const user = res?.data;
        if (user) {
          this.auth.updateCurrentUser(user);
          this.toastr.success('Foto de perfil actualizada.');
        }
      },
      error: () => {
        this.uploadingPhoto = false;
        input.value = '';
      }
    });
  }

  onNavPointerDown(event: Event): void {
    const target = event.target as HTMLElement | null;
    if (!target) {
      return;
    }

    const link = target.closest('a.nav-item') as HTMLElement | null;
    if (!link) {
      return;
    }

    // Ocurre antes del click: evita que el link retenga foco cuando Flowbite oculte el drawer.
    link.blur();
  }

  onNavInteraction(event: Event): void {
    const target = event.target as HTMLElement | null;
    if (!target) {
      return;
    }

    const link = target.closest('a.nav-item') as HTMLElement | null;
    if (!link) {
      return;
    }

    link.blur();
    const main = document.querySelector('main') as HTMLElement | null;
    if (main) {
      const hadTabIndex = main.hasAttribute('tabindex');
      if (!hadTabIndex) {
        main.setAttribute('tabindex', '-1');
      }
      main.focus({ preventScroll: true });
      if (!hadTabIndex) {
        setTimeout(() => main.removeAttribute('tabindex'), 0);
      }
    }

    this.closeMobileSidebarSafely();
  }

  private closeMobileSidebarSafely(): void {
    if (window.innerWidth >= 640) {
      return;
    }

    this.setMobileSidebarOpen(false);

    // Fallback: fuerza estado oculto por si Flowbite no alcanza a cerrar durante el cambio de ruta.
    setTimeout(() => {
      this.setMobileSidebarOpen(false);

      document.body.classList.remove('overflow-hidden');
      this.removeMobileDrawerBackdrops();
    }, 0);

    document.body.classList.remove('overflow-hidden');
    this.removeMobileDrawerBackdrops();
  }

  isStaffUser(): boolean {
    return this.auth.isStaff();
  }

  /** Staff (escáner) o quien puede generar QR de hogar. */
  showCodigoQrNav(): boolean {
    return this.auth.isStaff() || this.auth.canGenerateHouseAccessQr();
  }

  showReservationsNav(): boolean {
    return this.auth.canAccessReservationsPage();
  }

  /** Listados de gestión (admin u operario con combinación válida en sesión). */
  showGestionNav(): boolean {
    const r = String(this.user?.role_system ?? '').toUpperCase();
    return (r === 'ADMINISTRADOR' || r === 'OPERARIO') && this.auth.isSessionRolePersonValid();
  }

  showAccessPointsNav(): boolean {
    return this.auth.isAdministratorRole() && this.auth.isSessionRolePersonValid();
  }

  private removeMobileDrawerBackdrops(): void {
    // Limpia backdrops residuales del drawer móvil que pueden bloquear clics.
    const backdropSelectors = [
      '[drawer-backdrop]',
      '[data-drawer-backdrop]',
      '.drawer-backdrop',
      'div.fixed.inset-0.z-30.bg-gray-900\\/50',
      'div.fixed.inset-0.z-30.dark\\:bg-gray-900\\/80'
    ];

    backdropSelectors.forEach((selector) => {
      document.querySelectorAll(selector).forEach((el) => el.remove());
    });
  }
}