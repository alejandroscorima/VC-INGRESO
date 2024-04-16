import { AfterViewInit, Component, OnInit } from '@angular/core';
import { User } from '../user';
import { House } from '../house';
import { initFlowbite } from 'flowbite';
import { EntranceService } from '../entrance.service';
import { CookiesService } from '../cookies.service';
import { UsersService } from '../users.service';
import { Vehicle } from '../vehicle';

@Component({
  selector: 'app-my-house',
  templateUrl: './my-house.component.html',
  styleUrls: ['./my-house.component.css']
})
export class MyHouseComponent implements OnInit, AfterViewInit {

  users: User[] = [];
  userToAdd: User = new User('','','','','','','','','','','','','','','','','','','','','',0,0,'','','');
  userToEdit: User = new User('','','','','','','','','','','','','','','','','','','','','',0,0,'','','');

  houses: House[] = [];
  houseToAdd: House = new House('',0,'');
  houseToEdit: House = new House('',0,'');

  myFamily: User[] = [];
  myVehicles: Vehicle[] = [];

  user_id;
  userOnSes: User = new User('','','','','','','','','','','','','','','','','','','','','',0,0,'','','');

  typeDocs: string[] = ['DNI','CE'];
  genders: string[] = ['MASCULINO','FEMENINO'];
  roles: string[] = ['USUARIO','ADMINISTRADOR'];
  status: string[] = ['PERMITIDO','DENEGADO'];
  categories: string[] = ['PROPIETARIO','INVITADO'];

  constructor(
    private entranceService: EntranceService,
    private cookiesService: CookiesService,
    private usersService: UsersService
  ){}

  ngOnInit(): void {

    this.user_id=this.cookiesService.getToken('user_id');
    this.usersService.getUserById(this.user_id).subscribe((resUser:User)=>{
      if(resUser){
        this.userOnSes=resUser;
        this.entranceService.getPersonsByHouseId(this.userOnSes.house_id).subscribe((resMyFamily:User[])=>{
          this.myFamily=resMyFamily;
        })
        this.entranceService.getVehiclesByHouseId(this.userOnSes.house_id).subscribe((resMyVehicles:Vehicle[])=>{
          this.myVehicles=resMyVehicles;
        })
      }
    })
    
  }

  ngAfterViewInit(): void {
    initFlowbite();
  }

  newHouse(){

  }

  editHouse(house:House){

  }

  saveEditHouse(){

  }

  saveNewHouse(){

  }

  

}
