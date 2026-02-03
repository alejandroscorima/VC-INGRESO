import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Area } from './area';
import { AccessPoint } from './accessPoint';
import { CookiesService } from './cookies.service';
import { EntranceService } from './entrance.service';
import { User } from './user';
import { UsersService } from './users.service';
import { MatSidenav } from '@angular/material/sidenav';
import { Payment } from './payment';
import { ToastrService } from 'ngx-toastr';
import { Collaborator } from './collaborator';
import { AuthService } from './auth.service';

import { initFlowbite } from 'flowbite';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  title = 'web-app';

  //user: User = new User('','','','','','',0,0,'','');

  user: User = new User('','','','','','','','','','','','','',0,'','','','','','','','','','','',0,'',0);

  collaborator: Collaborator = new Collaborator(0,0,0,0,'','','','','','','','')

  user_area: Area = new Area('',null,'');




  user_campus: AccessPoint = new AccessPoint('','','','');

  user_id;
  logged;

  @ViewChild(MatSidenav) sidenav!: MatSidenav;
  @ViewChild("table1") table: ElementRef;


  constructor(private router: Router,
    private cookies: CookiesService,
    private usersService: UsersService,
    private entranceService: EntranceService,
    private toastr: ToastrService,
    private auth: AuthService,
  ){}

  logout(){
    this.cookies.deleteToken('user_id');
    this.cookies.deleteToken('user_role');
    this.cookies.deleteToken('userOnSes');
    this.auth.logout();
    this.logged = false;
  }

  ngOnInit() {
    initFlowbite();
    // Reflect auth state changes (login/logout) without reload
    this.auth.user$.subscribe((user) => {
      this.logged = !!user;
      if (user) {
        this.user = user;
        this.usersService.setUsr(user);
      }
    });

    // Si no hay sesión activa (ni token ni cookie heredada), no llames al backend: evita bucles de navegación
    const storedUser = this.auth.getUser();
    const cookieUserId = this.cookies.checkToken('user_id') ? parseInt(this.cookies.getToken('user_id'), 10) : null;
    if (!storedUser && !cookieUserId) {
      this.logged = false;
      if (this.router.url !== '/login') {
        this.router.navigateByUrl('/login');
      }
      return;
    }

    this.usersService.getPaymentByClientId(1).subscribe((resPay: Payment) => {
      if (resPay.error) {
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

  private handleLicenseError(error: any): void {
    this.cookies.deleteToken("user_id");
    this.cookies.deleteToken("role_system");
    this.cookies.deleteToken('sala');
    this.cookies.deleteToken('onSession');
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
}
