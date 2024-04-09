import { Component, OnInit } from '@angular/core';
import { User } from '../user';
import { UsersService } from '../users.service';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit{

  users: User[] = [];

  constructor(
    private usersService: UsersService,

  ){}

  ngOnInit(){
    this.usersService.getAllUsers().subscribe((res:any[])=>{
      this.users=res;
    })
  }

}
