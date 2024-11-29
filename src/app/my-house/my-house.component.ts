import { AfterViewInit, Component, OnInit } from '@angular/core';
import { User } from '../user';
import { House } from '../house';
import { initFlowbite } from 'flowbite';
import { EntranceService } from '../entrance.service';
import { CookiesService } from '../cookies.service';
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
  myVehicles: Vehicle[] = [];

  user_id;
  userOnSes: User = new User('','','','','','','','','','','','','',0,'','','','','','','','','','','',0,'',0);

  typeDocs: string[] = ['DNI','CE'];
  genders: string[] = ['MASCULINO','FEMENINO'];
  roles: string[] = ['USUARIO','ADMINISTRADOR','OPERARIO'];
  status: string[] = ['PERMITIDO','DENEGADO','OBSERVADO'];
  categories: string[] = ['PROPIETARIO','INVITADO'];

  vehicleToAdd = new Vehicle('','',0,'','','','');
  vehicleToEdit = new Vehicle('','',0,'','','','');
  vehicles: Vehicle[] = [];
  externalVehicleToAdd = new ExternalVehicle('','','','','','','','',);
  externalVehicleToEdit = new ExternalVehicle('','','','','','','','',);
  externalVehicles: ExternalVehicle[] = [];

  constructor(
    private entranceService: EntranceService,
    private cookiesService: CookiesService,
    private usersService: UsersService,
    private toastr: ToastrService,
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
        this.entranceService.getAllExternalVehicles().subscribe({
          next: (res: any[]) => { this.externalVehicles = res; },
          error: (err) => { console.error('Error obteniendo vehículos externos:', err); }
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
  

  private handleSuccess() {
    this.clean();
    this.entranceService.getAllVehicles().subscribe((res: any[]) => {
      this.vehicles = res;
    });
    this.entranceService.getAllExternalVehicles().subscribe((resExt: any[]) => {
      this.externalVehicles = resExt;
    });
  }
  
  public clean(){
    this.vehicleToAdd = new Vehicle('','',0,'','','','');
    this.vehicleToEdit = new Vehicle('','',0,'','','','');
    this.externalVehicleToAdd = new ExternalVehicle('','','','','','','','',);
    this.externalVehicleToEdit = new ExternalVehicle('','','','','','','','',);
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
