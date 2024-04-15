import { AfterViewInit, Component, OnInit } from '@angular/core';
import { User } from '../user';
import { UsersService } from '../users.service';
import { initFlowbite } from 'flowbite';
import { House } from '../house';
import { EntranceService } from '../entrance.service';
import { ToastrService } from 'ngx-toastr';

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
  status: string[] = ['PERMITIDO','DENEGADO','OBSERVADO'];
  categories: string[] = ['PROPIETARIO','INVITADO'];

  constructor(
    private usersService: UsersService,
    private entranceService: EntranceService,
    private toastr: ToastrService,
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

  searchUser(doc_number: string){
    console.log('Buscando documento:'+doc_number);
    this.usersService.getUserByDocNumber(doc_number).subscribe((resExistentUser:User)=>{
      if(resExistentUser){
        console.log('Encontrado en BD');
        if(resExistentUser.entrance_role!='SN'&&resExistentUser.entrance_role!='NINGUNO'&&resExistentUser.entrance_role!=''){
          this.clean();
          this.toastr.warning('El usuario ya existe');
        }
        else{
          this.toastr.success('Datos obtenidos correctamente');
          this.userToAdd.user_id=resExistentUser.user_id;
          this.userToAdd.type_doc=resExistentUser.type_doc;
          this.userToAdd.first_name=resExistentUser.first_name;
          this.userToAdd.paternal_surname=resExistentUser.paternal_surname;
          this.userToAdd.maternal_surname=resExistentUser.maternal_surname;
          this.userToAdd.gender=resExistentUser.gender;
          this.userToAdd.birth_date=resExistentUser.birth_date;
        }
      }
      else if(doc_number.trim().length==8){
        console.log('No encontrado en BD, pero con DNI. Buscando en RENIEC');
        this.usersService.getUserFromReniec(doc_number).subscribe((resReniecUser:any)=>{
          if(resReniecUser&&resReniecUser['success']){
            this.toastr.success('Datos obtenidos correctamente');
            this.userToAdd.type_doc='DNI';
            this.userToAdd.first_name=resReniecUser['data']['nombres'];
            this.userToAdd.paternal_surname=resReniecUser['data']['apellido_paterno'];
            this.userToAdd.maternal_surname=resReniecUser['data']['apellido_materno'];
            this.userToAdd.gender=resReniecUser['data']['sexo'];
            this.userToAdd.birth_date=resReniecUser['data']['fecha_nacimiento'];
          }
          else{
            this.noData();
          }
        },(error:any)=>{
          this.noData();
        })
      }
      else{
        this.noData();
      }
    })
  }

  noData(){
    this.clean();
    this.toastr.info('No se encontraron datos');

  }

  clean(){
    this.userToAdd = new User('','','','','','','','','','','','','','','','','','','','','',0,0,'','','');
    this.userToEdit = new User('','','','','','','','','','','','','','','','','','','','','',0,0,'','','');
  }

  newUser(){
    document.getElementById('new-user-button')?.click();
  }

  editUser(user:User){
    this.userToEdit = user;
    document.getElementById('edit-user-button')?.click();
  }

  saveNewUser(){
    this.userToAdd.password=this.userToAdd.doc_number;
    this.userToAdd.photo_url='http://52.5.47.64/VC/Media/noimage.png';
    this.usersService.getUserByDocNumber(this.userToAdd.doc_number).subscribe((resExistentUser:User)=>{
      if(resExistentUser){
        this.userToAdd.user_id=resExistentUser.user_id;
      }
      if(resExistentUser&&resExistentUser.entrance_role!='NINGUNO'&&resExistentUser.entrance_role!='SN'&&resExistentUser.entrance_role!=''){
        this.clean();
        this.toastr.warning('El usuario ya existe');
      }
      else{
        if(this.userToAdd.user_id&&this.userToAdd.user_id!=0){
          console.log('User new para update',this.userToAdd);
          this.usersService.updateUser(this.userToAdd).subscribe(resUpdateUser=>{
            if(resUpdateUser){
              this.clean();
              this.usersService.getAllUsers().subscribe((res:any[])=>{
                this.users=res;
              })
            }
          })
        }
        else{
          this.usersService.addUser(this.userToAdd).subscribe(resAddUser=>{
            if(resAddUser){
              this.clean();
              this.usersService.getAllUsers().subscribe((res:any[])=>{
                this.users=res;
              })
            }
          });
        }
      }
    });

  }

  saveEditUser(){
    this.usersService.updateUser(this.userToEdit).subscribe(resUpdateUser=>{
      if(resUpdateUser){
        this.clean();
      }
    })
  }
}
