import { AfterViewInit, Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NavigationEnd, NavigationStart, Router, RouterLink } from '@angular/router';
import { Area } from './area';
import { AccessPoint } from './accessPoint';
import { AuthService } from './auth.service';
import { EntranceService } from './entrance.service';
import { User } from './user';
import { UsersService } from './users.service';
import { MatSidenav } from '@angular/material/sidenav';
import { Payment } from './payment';
import { ToastrService } from 'ngx-toastr';
import { Collaborator } from './collaborator';
import { ApiService } from './api.service';

import { initFlowbite } from 'flowbite';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, AfterViewInit, OnDestroy {

  title = 'web-app';

  //user: User = new User('','','','','','',0,0,'','');

  user: User = new User('','','','','','','','','','','','','','',0,'','','','','','','','','','',0,'',0);

  collaborator: Collaborator = new Collaborator(0,0,0,0,'','','','','','','','')

  user_area: Area = new Area('',null,'');




  user_campus: AccessPoint = new AccessPoint('','','','');

  user_id;
  logged;

  @ViewChild(MatSidenav) sidenav!: MatSidenav;
  @ViewChild("table1") table: ElementRef;

  private focusGuardObserver: MutationObserver | null = null;
  private readonly flowbiteToggleSelector = '[data-modal-hide], [data-modal-toggle], [data-drawer-hide], [data-drawer-toggle]';


  constructor(
    private router: Router,
    protected auth: AuthService,
    private usersService: UsersService,
    private entranceService: EntranceService,
    protected toastr: ToastrService,
    protected api: ApiService,
  ){}

  logout(){
    this.auth.deleteToken('user_id');
    this.auth.deleteToken('user_role');
    this.auth.deleteToken('userOnSes');
    this.auth.logout();
    this.logged = false;
  }

  ngOnInit() {
    initFlowbite();
    const saved = localStorage.getItem('theme');
    this.isDark = saved === 'dark';
    this.applyTheme();
    // Reflect auth state changes (login/logout) without reload
    this.auth.user$.subscribe((user) => {
      this.logged = !!user;
      if (user) {
        this.user = user;
        this.usersService.setUsr(user);
      }
    });

    // Antes de cada cambio de ruta, libera foco si está dentro del sidebar.
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.blurActiveInSidebar();
      }
      if (event instanceof NavigationEnd) {
        this.cleanupMobileDrawerArtifacts();
      }
    });

    // Si no hay sesión activa (ni token ni cookie heredada), no llames al backend: evita bucles de navegación
    const storedUser = this.auth.getUser();
    const cookieUserId = this.auth.checkToken('user_id') ? parseInt(this.auth.getTokenItem('user_id'), 10) : null;
    if (!storedUser && !cookieUserId) {
      this.logged = false;
      if (this.router.url !== '/login') {
        this.router.navigateByUrl('/login');
      }
      return;
    }

    this.usersService.getPaymentByClientId(1).subscribe((resPay: Payment) => {
      if (resPay?.error) {
        this.handleLicenseError(resPay.error);
      } else {
        const existing = this.auth.getUser();
        if (existing) {
          this.logged = true;
          this.user = existing;
          this.usersService.setUsr(existing);
        } else if (cookieUserId) {
          this.user.user_id = cookieUserId;
          this.logged = true;

          this.usersService.getUserById(this.user.user_id).subscribe((u: User) => {
            this.user = u;
            this.usersService.setUsr(u);
            // Sincronizar auth storage para siguientes cargas
            localStorage.setItem('auth_user', JSON.stringify(u));
            this.auth['userSubject'].next(u as any);
          });
        } else {
          this.router.navigateByUrl('/login');
        }
      }
    }, (error) => {
      this.handleLicenseError(error);
    });
  }

  ngAfterViewInit(): void {
    // Flowbite alterna aria-hidden/class hidden al abrir/cerrar overlays; este guard evita
    // mantener el foco dentro de un contenedor ya oculto (warning de accesibilidad).
    document.addEventListener('click', this.onPotentialOverlayToggle, true);

    this.focusGuardObserver = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (!(mutation.target instanceof HTMLElement)) {
          continue;
        }

        const target = mutation.target;
        const becameAriaHidden = mutation.attributeName === 'aria-hidden' && target.getAttribute('aria-hidden') === 'true';
        const becameClassHidden = mutation.attributeName === 'class' && target.classList.contains('hidden');

        if (becameAriaHidden || becameClassHidden) {
          this.releaseFocusIfHidden();
        }
      }
    });

    this.focusGuardObserver.observe(document.body, {
      attributes: true,
      subtree: true,
      attributeFilter: ['aria-hidden', 'class']
    });
  }

  ngOnDestroy(): void {
    document.removeEventListener('click', this.onPotentialOverlayToggle, true);
    if (this.focusGuardObserver) {
      this.focusGuardObserver.disconnect();
      this.focusGuardObserver = null;
    }
  }

  private readonly onPotentialOverlayToggle = (event: Event): void => {
    const target = event.target as HTMLElement | null;
    if (!target) {
      return;
    }

    if (target.closest('#logo-sidebar a, #logo-sidebar button')) {
      // Previene warning cuando Flowbite oculta el drawer con foco aún dentro del sidebar.
      this.blurActiveInSidebar();
    }

    if (target.closest(this.flowbiteToggleSelector)) {
      setTimeout(() => this.releaseFocusIfHidden(), 0);
    }
  };

  private blurActiveInSidebar(): void {
    const active = document.activeElement as HTMLElement | null;
    if (!active) {
      return;
    }

    if (active.closest('#logo-sidebar')) {
      active.blur();
      this.focusMainContent();
    }
  }

  private releaseFocusIfHidden(): void {
    const active = document.activeElement as HTMLElement | null;
    if (!active || active === document.body) {
      return;
    }

    const hiddenAncestor = active.closest('[aria-hidden="true"], .hidden');
    if (!hiddenAncestor) {
      return;
    }

    active.blur();
    this.focusMainContent();
  }

  private focusMainContent(): void {
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
      return;
    }

    (document.body as HTMLElement).focus();
  }

  private cleanupMobileDrawerArtifacts(): void {
    if (window.innerWidth >= 640) {
      return;
    }

    this.setMobileSidebarOpen(false);
    this.ensureMobileSidebarToggleVisible();

    // Limpia cualquier backdrop residual del drawer móvil (Flowbite u otros).
    document.querySelectorAll('body > div').forEach((el) => {
      const node = el as HTMLElement;
      const cls = node.className || '';
      const isFullScreen = cls.includes('fixed') && cls.includes('inset-0');
      const looksLikeDrawerBackdrop = cls.includes('bg-gray-900/50') || cls.includes('dark:bg-gray-900/80') || cls.includes('drawer-backdrop');
      if (isFullScreen && looksLikeDrawerBackdrop) {
        node.remove();
      }
    });
  }

  onMobileSidebarToggle(event: Event): void {
    if (window.innerWidth >= 640) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    const sidebar = document.getElementById('logo-sidebar');
    const isOpen = !!sidebar && !sidebar.classList.contains('-translate-x-full');
    this.setMobileSidebarOpen(!isOpen);
    this.ensureMobileSidebarToggleVisible();
  }

  protected setMobileSidebarOpen(open: boolean): void {
    if (window.innerWidth >= 640) {
      return;
    }

    const sidebar = document.getElementById('logo-sidebar');
    if (sidebar) {
      if (open) {
        sidebar.classList.remove('-translate-x-full');
        sidebar.classList.add('translate-x-0');
        sidebar.setAttribute('aria-hidden', 'false');
      } else {
        sidebar.classList.remove('translate-x-0');
        sidebar.classList.remove('transform-none');
        sidebar.classList.add('-translate-x-full');
        sidebar.setAttribute('aria-hidden', 'true');
      }
    }

    document.body.classList.remove('overflow-hidden');
  }

  private ensureMobileSidebarToggleVisible(): void {
    const toggleBtn = document.getElementById('mobile-sidebar-toggle');
    if (!toggleBtn) {
      return;
    }

    toggleBtn.classList.remove('hidden', 'invisible');
    (toggleBtn as HTMLElement).style.removeProperty('display');
    (toggleBtn as HTMLElement).style.removeProperty('visibility');
    toggleBtn.removeAttribute('hidden');
  }

  private handleLicenseError(error: any): void {
    this.auth.deleteToken("user_id");
    this.auth.deleteToken("role_system");
    this.auth.deleteToken('sala');
    this.auth.deleteToken('onSession');
    console.error('Error al obtener la licencia:', error);
    this.toastr.error('Error al obtener la licencia: ' + error);
    this.router.navigateByUrl('/login');
  }

  onMenuItemClick() {
    // Solo cerramos el sidenav si el ancho de la ventana es menor a 500px
    if (window.innerWidth < 500) {
      this.sidenav.close();
    }
  }

  dropdownOpen = false;

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  /** Tema claro/oscuro: se aplica con clase 'dark' en <html> para Tailwind dark: */
  isDark = false;

  toggleTheme(): void {
    this.isDark = !this.isDark;
    this.applyTheme();
  }

  private applyTheme(): void {
    const html = document.documentElement;
    if (this.isDark) {
      html.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      html.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }

  /** URL del avatar del usuario: photo_url (con baseUrl si es ruta) si existe, o asset por género. */
  getUserAvatarUrl(user: User | null): string {
    if (!user) return 'assets/user-male.png';
    const url = (user as any).photo_url;
    if (url && typeof url === 'string' && url.trim().length > 0) {
      const full = this.api.getPhotoUrl(url);
      return full || 'assets/user-male.png';
    }
    const g = ((user as any).gender || '').toString().toUpperCase();
    return (g === 'FEMENINO' || g === 'F') ? 'assets/user-female.png' : 'assets/user-male.png';
  }

  /** Nombre completo para mostrar (maneja undefined). */
  getUserDisplayName(user: User | null): string {
    if (!user) return '—';
    const first = (user as any).first_name ?? '';
    const paternal = (user as any).paternal_surname ?? '';
    const maternal = (user as any).maternal_surname ?? '';
    const parts = [first, paternal, maternal].filter(Boolean);
    return parts.length ? parts.join(' ') : '—';
  }

  /** Domicilio Mz/Lt (y Dpto si aplica) para mostrar en side-nav y nav-bar. */
  getUserDomicilio(user: User | null): string {
    if (!user) return '—';
    const mz = (user as any).block_house ?? '—';
    const lt = (user as any).lot ?? '—';
    const apt = (user as any).apartment;
    const base = `Mz:${mz} Lt:${lt}`;
    return apt != null && String(apt).trim() !== '' ? `${base} Dpto:${apt}` : base;
  }
}
