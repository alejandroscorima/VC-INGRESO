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
import { Campus } from '../campus';
import { Payment } from '../payment';


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

  username='';
  password='';

  hide = true;

  //user: User = new User(null,null,null,null,null,null,null,null,null,null,null);
  user: User = new User(null,null,null,null,null,null,null,null,null,
    null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null);


  listaReq: Item[]= [];

  dataSourceReq: MatTableDataSource<Item>;

  @ViewChildren(MatPaginator) paginator= new QueryList<MatPaginator>();
  @ViewChildren(MatSort) sort= new QueryList<MatSort>();

  constructor(    private clientesService: ClientesService,
    private usersService: UsersService,
    private cookiesService: CookiesService,
    private cookies: CookiesService,
    public dialog: MatDialog,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private router: Router,
    private toastr: ToastrService,
  ) { }

  searchItem(){

  }



  dateChange(value){

  }


  onKeyup(e){

  }

  login(){

    this.usersService.getPaymentByClientId(1).subscribe((resPay:Payment)=>{
      console.log(resPay);
      if(resPay.error){
        this.cookies.deleteToken("user_id");
        this.cookies.deleteToken("user_role");
        this.cookies.deleteToken('sala');
        this.cookies.deleteToken('onSession');
        console.error('Error al obtener el pago:', resPay.error);
        this.toastr.error('Error al obtener la licencia: '+resPay.error);
        this.router.navigateByUrl('/login');

      }
      else{

        this.username=this.username.trim();
        this.password=this.password.trim();
        this.usersService.getUser(this.username,this.password).subscribe((res:User)=>{
          if(res){
            this.user=res;
            if(this.user.entrance_role!='NINGUNO'){
              this.cookiesService.setToken('user_id',String(this.user.user_id));
              location.reload();
            }
            else{
              this.toastr.warning('El usuario no tiene permisos');
            }
  
    
          }
          else{
            if(this.username==''||this.password==''){
              this.toastr.warning('Ingresa un usuario y contraseña');
            }
            else{
              this.toastr.error('Usuario y/o contraseña incorrecto(s)');
            }
    
          }
        })
      }
    },
    (error) => {
    
      this.cookies.deleteToken("user_id");
      this.cookies.deleteToken("user_role");
      this.cookies.deleteToken('sala');
      this.cookies.deleteToken('onSession');
      console.error('Error al obtener el pago:', error);

      // Maneja el error aquí según tus necesidades
      this.toastr.error('Error al obtener la licencia: '+error);
      this.router.navigateByUrl('/login');
    });

  }


  ngOnInit() {

    if(this.cookiesService.checkToken('user_id')){

      this.router.navigateByUrl('/');

    }
    else{
      this.router.navigateByUrl('/login');
    }
  }

  onSubmit() {
  }





}





