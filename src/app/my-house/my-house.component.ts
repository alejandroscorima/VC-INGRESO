import { AfterViewInit, Component, OnInit } from '@angular/core';
import { User } from '../user';
import { House } from '../house';

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

  typeDocs: string[] = ['DNI','CE'];
  genders: string[] = ['MASCULINO','FEMENINO'];
  roles: string[] = ['USUARIO','ADMINISTRADOR'];
  status: string[] = ['PERMITIDO','DENEGADO'];
  categories: string[] = ['PROPIETARIO','INVITADO'];

  constructor(

  ){}

  ngOnInit(): void {
    
  }

  ngAfterViewInit(): void {
    
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
