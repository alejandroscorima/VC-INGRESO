import { Component, ComponentFactoryResolver, ElementRef, EventEmitter, HostListener, Inject, Input, OnInit, Output, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { ClientesService } from "../clientes.service"
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
import { CookiesService } from '../cookies.service';
import { Session } from 'protractor';
import { Area } from '../area';
import { AccessPoint } from '../accessPoint';
import { Payment } from '../payment';
import { SystemClient } from '../systemClient';
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

  //user: User = new User(null,null,null,null,null,null,null,null,null,null,null);
  user: User = new User('','','','','','','','','','','','','',0,'','','','','','','','','','','',0,'',0);


  listaReq: Item[]= [];

  systemClient: SystemClient = new SystemClient('','','','','');

  dataSourceReq: MatTableDataSource<Item>;

  @ViewChildren(MatPaginator) paginator= new QueryList<MatPaginator>();
  @ViewChildren(MatSort) sort= new QueryList<MatSort>();

  constructor(private clientesService: ClientesService,
    private usersService: UsersService,
    private cookiesService: CookiesService,
    private cookies: CookiesService,
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
          this.cookiesService.setToken('user_id', String(this.user.user_id));
          this.cookiesService.setToken('user_role', String(this.user.role_system));
          this.cookiesService.setToken('userOnSes', JSON.stringify(this.user));

          // Ahora que hay token, validar licencia
          this.usersService.getPaymentByClientId(1).subscribe({
            next: (resPay: Payment) => {
              this.isloading = false;
              if ((resPay as any)?.error) {
                this.cookies.deleteToken("user_id");
                this.cookies.deleteToken("user_role");
                this.cookies.deleteToken('sala');
                this.cookies.deleteToken('onSession');
                this.toastr.error('Error al obtener la licencia: ' + (resPay as any).error);
                this.router.navigateByUrl('/login');
                return;
              }
              this.toastr.success('Inicio de sesión exitoso');
              this.router.navigateByUrl('/');
            },
            error: (error) => {
              this.isloading = false;
              this.cookies.deleteToken("user_id");
              this.cookies.deleteToken("user_role");
              this.cookies.deleteToken('sala');
              this.cookies.deleteToken('onSession');
              this.toastr.error('Error al obtener la licencia: ' + error);
              this.router.navigateByUrl('/login');
            }
          });
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

    this.clientesService.getSystemClientById(1).subscribe((sc:SystemClient)=>{
      if(sc){
        this.systemClient=sc;
      }
    })

    if(this.auth.isAuthenticated()){
      this.router.navigateByUrl('/');
    }
  }

  onSubmit() {
  }





}





