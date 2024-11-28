import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Vehicle } from '../vehicle';
import { House } from '../house';
import { initFlowbite } from 'flowbite';
import { EntranceService } from '../entrance.service';
import { ExternalVehicle } from '../externalVehicle';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-vehicles',
  templateUrl: './vehicles.component.html',
  styleUrls: ['./vehicles.component.css']
})
export class VehiclesComponent implements OnInit, AfterViewInit{

  vehicles: Vehicle[] = [];
  vehicleToAdd: Vehicle = new Vehicle('',0,'','','','','');
  vehicleToEdit: Vehicle = new Vehicle('',0,'','','','','');

  types: string[] = ['MOTOCICLETA','MOTO','AUTOMOVIL','CAMIONETA','MINIVAN'];
  categories: string[] = ['PROPIETARIO','INVITADO',];
  status: string[] = ['PERMITIDO','DENEGADO','OBSERVADO'];
  houses: House[] = [];

  externalVehicles: ExternalVehicle[] = [];
  externalVehicleToAdd: ExternalVehicle = new ExternalVehicle('','','','','','','','',);
  externalVehicleToEdit: ExternalVehicle = new ExternalVehicle('','','','','','','','',);
  temp_visit_type:string[]=['DELIVERY','COLECTIVO','TAXI'];

  constructor(
    private entranceService: EntranceService,
    private toastr: ToastrService,
  ){}

  ngOnInit(): void {
    this.entranceService.getAllVehicles().subscribe({
      next: (res: any[]) => { this.vehicles = res; },
      error: (err) => { console.error('Error obteniendo vehículos:', err); }
    });
    this.entranceService.getAllHouses().subscribe({
      next: (res: any[]) => { this.houses = res; },
      error: (err) => { console.error('Error obteniendo casas:', err); }
    });
    this.entranceService.getAllExternalVehicles().subscribe({
      next: (res: any[]) => { this.externalVehicles = res; },
      error: (err) => { console.error('Error obteniendo vehículos externos:', err); }
    });
  }

  private isFlowbiteInitialized = false;

  ngAfterViewInit(): void {
    if (!this.isFlowbiteInitialized) {
      initFlowbite();
      this.isFlowbiteInitialized = true;
    }
  }
//VEHÍCULOS DE RESIDENTES

  newVehicle(){
    document.getElementById('new-vehicle-button')?.click();
  }

  editVehicle(vehicle:Vehicle){
    this.vehicleToEdit = vehicle;
    document.getElementById('edit-vehicle-button')?.click();
  }

  saveEditVehicle(){
    this.entranceService.updateVehicle(this.vehicleToEdit).subscribe(resUpdateVehicle=>{
      if (resUpdateVehicle) this.refreshData();
    })
  }

  //VEHÍCULOS EXTERNOS
  newExternalVehicle(){
    document.getElementById('new-external-vehicle-button')?.click();
  }

  editExternalVehicle(externalVehicle:ExternalVehicle){
    this.externalVehicleToEdit = externalVehicle;
    document.getElementById('edit-external-vehicle-button')?.click();
  }

  saveEditExternalVehicle(){
    this.entranceService.updateExternalVehicle(this.externalVehicleToEdit).subscribe(resUpdateExternalVehicle=>{
      if (resUpdateExternalVehicle) this.refreshData();
    })
  }

  private refreshData(): void {
    this.entranceService.getAllVehicles().subscribe((res: any[]) => {
      this.vehicles = res;
    });
    this.entranceService.getAllExternalVehicles().subscribe((resExt: any[]) => {
      this.externalVehicles = resExt;
    });
  }
  
  saveNewVehicle(): void {
    this.vehicleToAdd.status_system='ACTIVO'
    this.entranceService.addVehicle(this.vehicleToAdd).subscribe(res => {
      this.toastr.success('Usuario guardado correctamente');
      console.log(this.vehicleToAdd);
      console.log(res);
      if (res) this.refreshData();
    });
  }
  
  saveNewExternalVehicle(): void {
    this.externalVehicleToAdd.status_system='ACTIVO'
    this.entranceService.addExternalVehicle(this.externalVehicleToAdd).subscribe(res => {
      this.toastr.success('Usuario guardado correctamente');
      console.log(this.vehicleToAdd);
      console.log(res);
      if (res) this.refreshData();
    });
  }
}
