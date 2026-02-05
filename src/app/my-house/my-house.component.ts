import { AfterViewInit, Component, OnInit } from '@angular/core';
import { User } from '../user';
import { House } from '../house';
import { initFlowbite } from 'flowbite';
import { EntranceService } from '../entrance.service';
import { AuthService } from '../auth.service';
import { UsersService } from '../users.service';
import { ExternalVehicle } from '../externalVehicle';
import { Vehicle } from '../vehicle';
import { ToastrService } from 'ngx-toastr';


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
  myVisits: User[] = [];
  myVehicles: Vehicle[] = [];

  user_id;
  userOnSes: User = new User('','','','','','','','','','','','','',0,'','','','','','','','','','','',0,'',0);

  typeDocs: string[] = ['DNI','CE'];
  genders: string[] = ['MASCULINO','FEMENINO'];
  roles: string[] = ['USUARIO','ADMINISTRADOR','OPERARIO'];
  status_validated: string[] = ['PERMITIDO','DENEGADO','OBSERVADO'];
  categories: string[] = ['PROPIETARIO','RESIDENTE','INQUILINO'];
  categories_visits: string[] = ['INVITADO'];
  types: string[] = ['MOTOCICLETA','MOTOTAXI','AUTOMOVIL','CAMIONETA','MINIVAN','BICICLETA','FURGONETA'];
  temp_visit_type:string[]=['DELIVERY','COLECTIVO','TAXI'];
  
  vehicleToAdd = new Vehicle('','',0,'','','','');
  vehicleToEdit = new Vehicle('','',0,'','','','');
  vehicles: Vehicle[] = [];
  externalVehicleToAdd = new ExternalVehicle('','','','','','','','',);
  externalVehicleToEdit = new ExternalVehicle('','','','','','','','',);
  externalVehicles: ExternalVehicle[] = [];

  constructor(
    private entranceService: EntranceService,
    private auth: AuthService,
    private usersService: UsersService,
    private toastr: ToastrService,
  ){}

  ngOnInit(): void {
    const userId = this.auth.getTokenItem('user_id');
    console.log('User ID:', userId);
    this.usersService.getUserById(Number(userId)).subscribe({
      next:(os:User)=>{
        this.userOnSes.house_id=os.house_id;
        this.entranceService.getPersonsByHouseId(this.userOnSes.house_id).subscribe({
          next: (resMyFamily: User[]) => {
            console.log('Datos devueltos por el servicio (sin filtrar):', resMyFamily);
            this.myFamily = resMyFamily.filter(user =>
              ['PROPIETARIO', 'RESIDENTE', 'INQUILINO'].includes(user.property_category)
            );
            console.log('Datos de myFamily (filtrados):', this.myFamily);
        
            this.myVisits = resMyFamily.filter(user => ['INVITADO'].includes(user.property_category)
          )||[];
            console.log('Datos de myVisits (filtrados):', this.myVisits);
          },
          error(err) {
            this.myVisits=[];
          },
        });
        this.entranceService.getVehiclesByHouseId(this.userOnSes.house_id).subscribe({
          next:( mv:Vehicle[])=>{
            this.myVehicles=mv;
            console.log('Datos de myVisits (filtrados):', this.myVehicles);
          },
          error(err) {
            this.myVehicles=[];
            console.log('Datos de myVisits (filtrados):', this.myVehicles);
          },
        });
        this.entranceService.getAllExternalVehicles().subscribe({
          next:( ev:ExternalVehicle[])=>{
            console.log('Datos de myVisits (filtrados):', this.externalVehicles);
            this.externalVehicles=ev;
          }
        });
      },
      error:(err)=>{
        console.log('No se pudo obtener al usuario en sesión:', err);
      }
    })
    
  }

  ngAfterViewInit(): void {
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

  newUser(){
    document.getElementById('new-user-button')?.click();
  }

  editUser(user:User){
    this.userToEdit = user;
    document.getElementById('edit-user-button')?.click();
  }
  newVisit(){
    document.getElementById('new-visit-button')?.click();
  }

  editVisit(user:User){
    this.userToEdit = user;
    document.getElementById('edit-visit-button')?.click();
  }
  
  clean(){
    this.userToAdd = new User('','','','','','','','','','','','','',0,'','','','','','','','','','','',0,'',0);
    this.userToEdit = new User('','','','','','','','','','','','','',0,'','','','','','','','','','','',0,'',0);
    this.vehicleToAdd = new Vehicle('','',0,'','','','');
    this.vehicleToEdit = new Vehicle('','',0,'','','','');
    this.externalVehicleToAdd = new ExternalVehicle('','','','','','','','',);
    this.externalVehicleToEdit = new ExternalVehicle('','','','','','','','',);
  }

  private handleSuccess() {
    this.clean();
    this.ngOnInit();
  }

  saveNewUser() {
    if (!this.validateUser(this.userToAdd)) {
      this.toastr.error("Por favor, completa todos los campos requeridos correctamente.");
      this.clean();
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
    this.userToAdd.house_id = this.userOnSes.house_id;
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
              this.toastr.success('Usuario guardado correctamente');
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

  saveEditUser(){
    this.userToEdit.house_id = this.userOnSes.house_id;
    this.usersService.updateUser(this.userToEdit).subscribe(resUpdateUser=>{
      if(resUpdateUser){
        this.toastr.success('Usuario actualizado correctamente');
        this.handleSuccess();
      }
    })
  }
// VEHÍCULOS DE RESIDENTES

newVehicle(){
  document.getElementById('new-vehicle-button')?.click();
}

editVehicle(vehicle:Vehicle){
  this.vehicleToEdit = vehicle;
  document.getElementById('edit-vehicle-button')?.click();
}

saveEditVehicle(){
  if(!this.vehicleToEdit.license_plate || !this.vehicleToEdit.house_id||!this.vehicleToEdit.type_vehicle){
    this.toastr.error('Los campos obligatorios no pueden estar vacíos');
    this.clean();
    return;
  }
  this.entranceService.updateVehicle(this.vehicleToEdit).subscribe({
    next:(resUpdate:any)=>{
      if(resUpdate.success){
        this.toastr.success(resUpdate.message);
        this.toastr.success('Vehículo actualizado correctamente');
        this.handleSuccess();
      }
      else{
        console.log(resUpdate.message);
        this.toastr.error('Error al actualizar el vehículo');
      }
    },
    error:(err)=>{
      console.log(err);
      this.toastr.error('Error al actualizar el vehículo')
    },
  })
}

saveNewVehicle(): void {
  //CAMPOS OBLIGATORIOS
  if(!this.vehicleToAdd.license_plate || !this.vehicleToAdd.house_id||!this.vehicleToAdd.type_vehicle){
    this.toastr.error('Los campos obligatorios no pueden estar vacíos');
    this.clean();
    return;
  }
  //HASTA AQUÍ
  this.vehicleToAdd.status_system='ACTIVO'
  if (!this.vehicleToAdd.status_validated){
    this.vehicleToAdd.status_validated='PERMITIDO'
  }
  this.entranceService.addVehicle(this.vehicleToAdd).subscribe({
    next:(res:any)=>{
      if(res.success){
        this.toastr.success(res.message);
        this.toastr.success('Vehículo guardado correctamente');
        this.handleSuccess();
      } else {
        console.log(res.message);
        this.toastr.error('Error al guardar el vehículo');
      }
    },
    error:(err)=>{
      console.error(err);
      this.toastr.error('Error al guardar el vehículo')
    }
  });
}


  //EXTERNAL VEHICLE
  newExternalVehicle(){
    document.getElementById('new-external-vehicle-button')?.click();
  }

  editExternalVehicle(externalVehicle:ExternalVehicle){
    this.externalVehicleToEdit = externalVehicle;
    document.getElementById('edit-external-vehicle-button')?.click();
  }

  saveEditExternalVehicle(){
    // Validar campos obligatorios
    if (!this.externalVehicleToEdit.temp_visit_plate || !this.externalVehicleToEdit.temp_visit_doc||!this.externalVehicleToEdit.temp_visit_cel) {
      this.toastr.error('Los campos obligatorios no pueden estar vacíos');
      this.clean();
      return;
    }
  
    this.entranceService.updateExternalVehicle(this.externalVehicleToEdit).subscribe({
      next: (resUpdateExternalVehicle: any) => {
        if (resUpdateExternalVehicle.success) {
          this.toastr.success(resUpdateExternalVehicle.message);
          this.toastr.success('Vehículo externo actualizado correctamente');
          this.handleSuccess();
        } else {
          console.log(resUpdateExternalVehicle.message);
          this.toastr.error('Error al actualizar el vehículo externo');
        }
      },
      error: (err) => {
        console.error(err);
        this.toastr.error('Error al actualizar el vehículo externo');
      },
    });
  }
  
  saveNewExternalVehicle(): void {
    // Validar campos obligatorios
    if (!this.externalVehicleToAdd.temp_visit_plate || !this.externalVehicleToAdd.temp_visit_doc||!this.externalVehicleToAdd.temp_visit_cel) {
      this.toastr.error('Los campos obligatorios no pueden estar vacíos');
      this.clean();
      return;
    }
  
    this.externalVehicleToAdd.status_system = 'ACTIVO';
  
    // Asignar un valor predeterminado si no existe
    if (!this.externalVehicleToAdd.status_validated) {
      this.externalVehicleToAdd.status_validated = 'PERMITIDO';
    }
  
    this.entranceService.addExternalVehicle(this.externalVehicleToAdd).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.toastr.success(res.message);
          this.handleSuccess();
        } else {
          console.log(res.message);
          this.toastr.error('Error al guardar el vehículo externo');
        }
      },
      error: (err) => {
        console.error(err);
        this.toastr.error('Error al guardar el vehículo externo');
      },
    });
  }
  


 
  /* SIWTCH ON/OFF
  toggleStatus(vehicle: any): void {
    // Alternar el estado entre 'ACTIVO' e 'INACTIVO'
    vehicle.status_system = vehicle.status_system === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
  
    // Realizar una actualización en el servidor
    this.entranceService.updateVehicle(vehicle).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.toastr.success(`Estado actualizado a ${vehicle.status_system}`);
        } else {
          this.toastr.error('Error al actualizar el estado');
        }
      },
      error: (err) => {
        console.error('Error al actualizar el estado:', err);
        this.toastr.error('Error al actualizar el estado');
      }
    });
  }*/
  

}
