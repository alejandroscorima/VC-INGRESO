
import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Area } from './area';
import { Campus } from './campus';
import { CookiesService } from './cookies.service';
import { EntranceService } from './entrance.service';
import { User } from './user';
import { UsersService } from './users.service';
import { MatSidenav } from '@angular/material/sidenav';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  user: User = new User('','','','','','',0,0,'','');
  user_area: Area = new Area('',null,'');
  user_campus: Campus = new Campus('','','','','','','');

  user_id;
  logged;

  @ViewChild(MatSidenav) sidenav!: MatSidenav;

  constructor(private router: Router,
    private cookies: CookiesService,
    private usersService: UsersService,
    private entranceService: EntranceService,
  ){}

  logout(){
    this.cookies.deleteToken('user_id');
    location.reload();
  }

  ngOnInit() {
    if(this.cookies.checkToken('user_id')){
      this.user.user_id=parseInt(this.cookies.getToken('user_id'));
      if(window.innerWidth<500){
        this.sidenav.close();
      }
      this.usersService.getUserById(this.user.user_id).subscribe((u:User)=>{
        this.user=u;
        this.entranceService.getAreaById(this.user.area_id).subscribe((a:Area)=>{
          if(a){
            this.user_area=a;
            this.entranceService.getCampusById(this.user.campus_id).subscribe((c:Campus)=>{
              if(c){
                this.user_campus=c;

              }
            })

          }
        })

      });
    }
    else{
      this.router.navigateByUrl('/login');

    }
  }
}