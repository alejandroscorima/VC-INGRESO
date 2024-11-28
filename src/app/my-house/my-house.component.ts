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
  userToAdd: User = new User('','','','','','','','','','','','','',0,'','','','','','','','','','','',0,'',0);
  userToEdit: User = new User('','','','','','','','','','','','','',0,'','','','','','','','','','','',0,'',0);

  houses: House[] = [];
  houseToAdd: House = new House('',0,null,'',0);
  houseToEdit: House = new House('',0,null,'',0);

  myFamily: User[] = [];
  myVehicles: Vehicle[] = [];

  user_id;
  userOnSes: User = new User('','','','','','','','','','','','','',0,'','','','','','','','','','','',0,'',0);

  typeDocs: string[] = ['DNI','CE'];
  genders: string[] = ['MASCULINO','FEMENINO'];
  roles: string[] = ['USUARIO','ADMINISTRADOR','OPERARIO'];
  status: string[] = ['PERMITIDO','DENEGADO','OBSERVADO'];
  categories: string[] = ['PROPIETARIO','INVITADO'];

  constructor(
    private entranceService: EntranceService,
    private cookiesService: CookiesService,
    private usersService: UsersService
  ){}

  ngOnInit(): void {
    this.usersService.user$.subscribe((resUser) => {
      if (resUser) {
        this.userOnSes = resUser;
        console.log(this.userOnSes);
  
        // Usa los datos del usuario para cargar otros recursos
        this.entranceService.getPersonsByHouseId(this.userOnSes.house_id).subscribe((resMyFamily: User[]) => {
          this.myFamily = resMyFamily;
        });
  
        this.entranceService.getVehiclesByHouseId(this.userOnSes.house_id).subscribe((resMyVehicles: Vehicle[]) => {
          this.myVehicles = resMyVehicles;
        });
      }
    });
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
