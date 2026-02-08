import { Component, ComponentFactoryResolver, ElementRef, EventEmitter, HostListener, Inject, Input, OnInit, Output, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { User } from "../user"
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ThemePalette } from '@angular/material/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Item } from '../item';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { ToastrService } from 'ngx-toastr';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { UsersService } from '../users.service';
import { Session } from 'protractor';
import { Area } from '../area';
import { AccessPoint } from '../accessPoint';
import { Payment } from '../payment';
import { AuthService } from '../auth.service';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0', display:'none'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class LoginComponent implements OnInit {
 
  username_system='';
  password_system='';

  hide = true;
  isloading=false;
  /** Modal: cambiar contraseña temporal (primer acceso tras registro público) */
  showChangePasswordModal = false;
  newPassword = '';
  confirmPassword = '';
  changingPassword = false;

  //user: User = new User(null,null,null,null,null,null,null,null,null,null,null);
  user: User = new User('','','','','','','','','','','','','',0,'','','','','','','','','','',0,'',0);


  listaReq: Item[]= [];

  /** Logo del cliente/sistema (antes SystemClient) */
  systemClient = { client_logo: '' as string };

  dataSourceReq: MatTableDataSource<Item>;

  @ViewChildren(MatPaginator) paginator= new QueryList<MatPaginator>();
  @ViewChildren(MatSort) sort= new QueryList<MatSort>();

  constructor(
    private usersService: UsersService,
    public dialog: MatDialog,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private router: Router,
    private toastr: ToastrService,
    private auth: AuthService,
  ) { }

  searchItem(){

  }



  dateChange(value){

  }


  onKeyup(e){

  }

  login(){
    this.isloading=true;
    this.username_system=this.username_system.trim();
    this.password_system=this.password_system.trim();

    this.auth.login(this.username_system, this.password_system).subscribe({
      next: (user: User) => {
        this.user = user;
        if (this.user.role_system && this.user.role_system !== 'NINGUNO') {
          this.auth.setToken('user_id', String(this.user.user_id));
          this.auth.setToken('user_role', String(this.user.role_system));
          this.auth.setToken('userOnSes', JSON.stringify(this.user));

          if (this.user.force_password_change) {
            this.isloading = false;
            this.showChangePasswordModal = true;
            return;
          }

          this.proceedAfterLogin();
        } else {
          this.isloading = false;
          this.toastr.warning('El usuario no tiene permisos');
        }
      },
      error: (err) => {
        this.isloading = false;
        if (this.username_system === '' || this.password_system === '') {
          this.toastr.warning('Ingresa un usuario y contraseña');
        } else {
          this.toastr.error(err?.message || 'Usuario y/o contraseña incorrecto(s)');
        }
      }
    });
  }


  ngOnInit() {
    this.route.queryParams.subscribe(q => {
      if (q['username']) this.username_system = q['username'];
    });
    if (this.auth.isAuthenticated()) {
      this.router.navigateByUrl('/');
    }
  }

  proceedAfterLogin(): void {
    this.usersService.getPaymentByClientId(1).subscribe({
      next: (resPay: Payment) => {
        this.isloading = false;
        if ((resPay as any)?.error) {
          this.auth.deleteToken('user_id');
          this.auth.deleteToken('user_role');
          this.auth.deleteToken('sala');
          this.auth.deleteToken('onSession');
          this.toastr.error('Error al obtener la licencia: ' + (resPay as any).error);
          this.router.navigateByUrl('/login');
          return;
        }
        this.toastr.success('Inicio de sesión exitoso');
        this.router.navigateByUrl('/');
      },
      error: (error) => {
        this.isloading = false;
        this.auth.deleteToken('user_id');
        this.auth.deleteToken('user_role');
        this.auth.deleteToken('sala');
        this.auth.deleteToken('onSession');
        this.toastr.error('Error al obtener la licencia: ' + error);
        this.router.navigateByUrl('/login');
      }
    });
  }

  submitChangePassword(): void {
    if (!this.newPassword || this.newPassword.length < 6) {
      this.toastr.warning('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    if (this.newPassword !== this.confirmPassword) {
      this.toastr.warning('Las contraseñas no coinciden');
      return;
    }
    const uid = this.user?.user_id ?? (this.user as any)?.user_id;
    if (!uid) {
      this.toastr.error('No se pudo identificar el usuario');
      return;
    }
    this.changingPassword = true;
    this.usersService.updatePerson(uid, { password_system: this.newPassword }).subscribe({
      next: () => {
        this.changingPassword = false;
        this.showChangePasswordModal = false;
        this.newPassword = '';
        this.confirmPassword = '';
        this.auth.setForcePasswordChangeDone();
        this.toastr.success('Contraseña actualizada. Bienvenido.');
        this.proceedAfterLogin();
      },
      error: () => {
        this.changingPassword = false;
        this.toastr.error('No se pudo actualizar la contraseña');
      }
    });
  }

  cancelChangePassword(): void {
    this.showChangePasswordModal = false;
    this.newPassword = '';
    this.confirmPassword = '';
    this.auth.deleteToken('user_id');
    this.auth.deleteToken('user_role');
    this.auth.deleteToken('userOnSes');
    this.toastr.info('Debe cambiar la contraseña para continuar');
  }

  onSubmit() {
  }





}





