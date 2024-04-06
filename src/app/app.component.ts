
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

import { initFlowbite } from 'flowbite';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  title = 'web-app';

  //user: User = new User('','','','','','',0,0,'','');

  user: User = new User('','','','','','','','','','','','','','','','','','','','','',0,0);

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
  ){}

  logout(){
    this.cookies.deleteToken('user_id');
    location.reload();
  }

  ngOnInit() {

    initFlowbite();

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
        console.log('No cumple licencia en APP MODULE 1');

      }
      else{
        if(this.cookies.checkToken('user_id')){
          this.user.user_id=parseInt(this.cookies.getToken('user_id'));
          this.logged=true;
          if(window.innerWidth<500){
            this.sidenav.close();
          }
          this.usersService.getUserById(this.user.user_id).subscribe((u:User)=>{
            this.user=u;

    
          });
        }
        else{
          this.router.navigateByUrl('/login');
    
        }
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
}
