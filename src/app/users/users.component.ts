import { AfterViewInit, Component, OnInit } from '@angular/core';
import { User } from '../user';
import { UsersService } from '../users.service';
import { initFlowbite } from 'flowbite';
import { House } from '../house';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit, AfterViewInit{

  users: User[] = [];
  userToAdd: User = new User('','','','','','','','','','','','','','','','','','','','','',0,0);
  userToEdit: User = new User('','','','','','','','','','','','','','','','','','','','','',0,0);

  typeDocs: string[] = ['DNI','CE'];
  genders: string[] = ['MASCULINO','FEMENINO'];
  roles: string[] = ['USUARIO','ADMINISTRADOR'];
  houses: House[] = [new House('ZZZ','123','111',999)];

  constructor(
    private usersService: UsersService,

  ){}

  ngOnInit(){
    this.usersService.getAllUsers().subscribe((res:any[])=>{
      this.users=res;
    })
  }

  ngAfterViewInit(){
    initFlowbite();
  }

  newUser(){
    document.getElementById('new-user-button')?.click();
  }

  editUser(user:User){
    document.getElementById('edit-user-button')?.click();
  }

  saveNewUser(){
    console.log(this.userToAdd);
  }

  saveEditUser(){

  }

}
