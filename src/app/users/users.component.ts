import { Component, OnInit } from '@angular/core';
import { User } from '../user';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit{

  users: User[] = [new User(0,0,0,0,0,'','','asd','fgh','jkl','','','','','','','','','','','','','','','','','','','','','')];

  constructor(

  ){}

  ngOnInit(){

  }

}
