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
  userToAdd: User = new User('','','','','','','','','','','','','',0,'','','','','','','','','','','',0,'',0);
  userToEdit: User = new User('','','','','','','','','','','','','',0,'','','','','','','','','','','',0,'',0);

  typeDocs: string[] = ['DNI','CE'];
  genders: string[] = ['MASCULINO','FEMENINO'];
  roles: string[] = ['USUARIO','ADMINISTRADOR','OPERARIO'];
  status: string[] = ['ACTIVO', 'INACTIVO']
  houses: House[] = [];
  status_validated: string[] = ['PERMITIDO','DENEGADO','OBSERVADO'];
  categories: string[] = ['PROPIETARIO','INVITADO'];

  constructor(
    private usersService: UsersService,
    private entranceService: EntranceService,
    private toastr: ToastrService,
  ){}

  ngOnInit(){
    this.usersService.getAllUsers().subscribe(
      (res:any[])=>{
        this.users=res;
    },)
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
      console.log(resExistentUser);
      if(resExistentUser.user_id){
        console.log('Encontrado en BD');
        if(resExistentUser.role_system!='SN'&&resExistentUser.role_system!='NINGUNO'&&resExistentUser.role_system!=''){
          this.clean();
          this.toastr.warning('El usuario ya existe');
        }
        else{
          this.toastr.success('Datos obtenidos correctamente');
          this.userToAdd=resExistentUser;
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
            this.userToAdd.civil_status=resReniecUser['data']['estado_civil'];
            this.userToAdd.address_reniec=resReniecUser['data']['direccion_completa'];
            this.userToAdd.district=resReniecUser['data']['distrito'];
            this.userToAdd.province=resReniecUser['data']['provincia'];
            this.userToAdd.region=resReniecUser['data']['departamento'];
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
    this.userToAdd = new User('','','','','','','','','','','','','',0,'','','','','','','','','','','',0,'',0);
    this.userToEdit = new User('','','','','','','','','','','','','',0,'','','','','','','','','','','',0,'',0);
  }

  newUser(){
    document.getElementById('new-user-button')?.click();
  }

  editUser(user:User){
    this.userToEdit = user;
    document.getElementById('edit-user-button')?.click();
  }

  saveNewUser() {
    if (!this.validateUser(this.userToAdd)) {
      this.toastr.error("Por favor, completa todos los campos requeridos correctamente.");
      return;
    }
    // Configurar valores predeterminados
    this.userToAdd.password_system = this.userToAdd.doc_number;
    if(this.userToAdd.gender=='MASCULINO'){
      this.userToAdd.photo_url='http://52.5.47.64/VC/Media/Profile-photos/user-male.png';
    }
    else{
      this.userToAdd.photo_url='http://52.5.47.64/VC/Media/Profile-photos/user-female.png';
    }
    this.userToAdd.status_system = 'ACTIVO';
  
    // Verificar existencia del usuario en la base de datos
    this.usersService.getUserByDocNumber(this.userToAdd.doc_number).subscribe((resExistentUser: User) => {
      if (resExistentUser) {
        // Asignar el ID del usuario existente
        this.userToAdd.user_id = resExistentUser.user_id;
  
        // Verificar si el usuario ya tiene un rol asignado
        if (
          resExistentUser.role_system &&
          resExistentUser.role_system !== 'NINGUNO' &&
          resExistentUser.role_system !== 'SN'
        ) {
          this.clean();
          this.toastr.warning('El usuario ya existe');
          return; // Salir si el usuario ya existe
        }
      }
  
      // Decidir si es una actualización o un nuevo registro
      if (this.userToAdd.user_id && this.userToAdd.user_id !== 0) {
        // Actualizar usuario existente
        console.log('User new para update:', this.userToAdd);
        this.usersService.updateUser(this.userToAdd).subscribe({
          next: (resUpdateUser) =>{
            if (resUpdateUser) {
              this.handleSuccess();
            }
          },
          error: (error) =>{
            this.toastr.error("Error al guardar el usuario. Inténtalo nuevamente.");
            console.error(error);
          },
          complete: () => {
            console.info('Proceso de actualización de usuario completado.');
          }
        })
      }
      else {
        // Agregar nuevo usuario
        this.usersService.addUser(this.userToAdd).subscribe({
          next: (resAddUser) => {
            if (resAddUser) {
              this.handleSuccess();
            }
          },
          error: (error) => {
            this.toastr.error("Error al guardar el usuario. Inténtalo nuevamente.");
            console.error(error);
          },
          complete: () => {
            console.info('Proceso de adición de usuario completado.');
          }
        });
      }
    });
  }
  
  private validateUser(user: User): boolean {
    if (!user.doc_number || user.doc_number.trim().length < 8) return false;
    if (!user.first_name) return false;
    // Agrega más validaciones según sea necesario.
    return true;
  }


  // Manejar éxito en la creación o actualización
  private handleSuccess() {
    this.clean();
    this.usersService.getAllUsers().subscribe((res: any[]) => {
      this.users = res;
      this.toastr.success('Usuario guardado correctamente');
    });
  }
  

  saveEditUser(){
    this.usersService.updateUser(this.userToEdit).subscribe(resUpdateUser=>{
      if(resUpdateUser){
        this.handleSuccess();
      }
    })
  }
}
