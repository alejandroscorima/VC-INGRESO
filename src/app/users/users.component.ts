import { AfterViewInit, Component, OnInit } from '@angular/core';
import { User } from '../user';
import { UsersService } from '../users.service';
import { initFlowbite } from 'flowbite';
import { House } from '../house';
import { EntranceService } from '../entrance.service';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit, AfterViewInit{

  users: User[] = [];
  userToAdd: User = new User('','','','','','','','','','','','','','','','','','','','','',0,0,'','','');
  userToEdit: User = new User('','','','','','','','','','','','','','','','','','','','','',0,0,'','','');

  typeDocs: string[] = ['DNI','CE'];
  genders: string[] = ['MASCULINO','FEMENINO'];
  roles: string[] = ['USUARIO','ADMINISTRADOR'];
  houses: House[] = [];
  status: string[] = ['PERMITIDO','DENEGADO'];
  categories: string[] = ['PROPIETARIO','INVITADO'];

  constructor(
    private usersService: UsersService,
    private entranceService: EntranceService,
  ){}

  ngOnInit(){
    this.usersService.getAllUsers().subscribe((res:any[])=>{
      this.users=res;
    })
    this.entranceService.getAllHouses().subscribe((resHouses:any[])=>{
      if(resHouses){
        this.houses=resHouses;
      }
    })
  }

  ngAfterViewInit(){
    initFlowbite();
  }

  newUser(){
    document.getElementById('new-user-button')?.click();
  }

  editUser(user:User){
    this.userToEdit = user;
    document.getElementById('edit-user-button')?.click();
  }

  saveNewUser(){
    console.log(this.userToAdd);
    this.usersService.addUser(this.userToAdd).subscribe(resAddUser=>{
      if(resAddUser){
        this.usersService.getAllUsers().subscribe((res:any[])=>{
          this.users=res;
        })
      }
    });
  }

  saveEditUser(){
    this.usersService.updateUser(this.userToEdit).subscribe(resUpdateUser=>{

    })
  }
}
