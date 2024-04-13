import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Vehicle } from '../vehicle';
import { House } from '../house';
import { initFlowbite } from 'flowbite';
import { EntranceService } from '../entrance.service';

@Component({
  selector: 'app-vehicles',
  templateUrl: './vehicles.component.html',
  styleUrls: ['./vehicles.component.css']
})
export class VehiclesComponent implements OnInit, AfterViewInit{

  vehicles: Vehicle[] = [];
  vehicleToAdd: Vehicle = new Vehicle('',null,'','','');
  vehicleToEdit: Vehicle = new Vehicle('',null,'','','');

  types: string[] = ['MOTOCICLETA','MOTO','AUTOMOVIL','CAMIONETA','MINIVAN'];
  status: string[] = ['PERMITIDO','DENEGADO'];
  houses: House[] = [];

  constructor(
    private entranceService: EntranceService
  ){}

  ngOnInit(): void {
    this.entranceService.getAllVehicles().subscribe((resVehicles:any[])=>{
      this.vehicles=resVehicles;
    })
    this.entranceService.getAllHouses().subscribe((resHouses:any[])=>{
      if(resHouses){
        this.houses=resHouses;
      }
    })
  }

  ngAfterViewInit(): void {
    initFlowbite();
  }

  newVehicle(){
    document.getElementById('new-vehicle-button')?.click();
  }

  editVehicle(vehicle:Vehicle){
    this.vehicleToEdit = vehicle;
    document.getElementById('edit-vehicle-button')?.click();
  }

  saveNewVehicle(){
    console.log(this.vehicleToAdd);
    this.entranceService.addVehicle(this.vehicleToAdd).subscribe(resAddVehicle=>{
      if(resAddVehicle){
        this.entranceService.getAllVehicles().subscribe((res:any[])=>{
          this.vehicles=res;
        })
      }
    });
  }

  saveEditVehicle(){
    this.entranceService.updateVehicle(this.vehicleToEdit).subscribe(resUpdateVehicle=>{

    })
  }

}
