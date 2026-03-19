import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Vehicle } from '../vehicle';
import { House } from '../house';
import { initFlowbite } from 'flowbite';
import { EntranceService } from '../entrance.service';
import { ExternalVehicle } from '../externalVehicle';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from '../api.service';

@Component({
  selector: 'app-vehicles',
  templateUrl: './vehicles.component.html',
  styleUrls: ['./vehicles.component.css']
})
export class VehiclesComponent implements OnInit, AfterViewInit{

  vehicles: Vehicle[] = [];
  vehicleToAdd: Vehicle = new Vehicle('','',0,'','','','');
  vehicleToEdit: Vehicle = new Vehicle('','',0,'','','','');

  types: string[] = ['MOTOCICLETA','MOTOTAXI','AUTOMOVIL','CAMIONETA','MINIVAN','BICICLETA','FURGONETA'];
  categories: string[] = ['PROPIETARIO','RESIDENTE','INVITADO','INQUILINO'];
  status: string[] = ['PERMITIDO','DENEGADO','OBSERVADO'];
  
  vehicleTypeIcons: { [key: string]: string } = {
    'MOTOCICLETA': 'two_wheeler',
    'MOTOTAXI': 'two_wheeler',
    'AUTOMOVIL': 'directions_car',
    'CAMIONETA': 'local_shipping',
    'MINIVAN': 'directions_bus',
    'BICICLETA': 'two_wheeler',
    'FURGONETA': 'local_shipping'
  };
  
  houses: House[] = [];
  
  externalVehicleTypeIcons: { [key: string]: string } = {
    'DELIVERY': 'local_shipping',
    'COLECTIVO': 'directions_bus',
    'TAXI': 'directions_car'
  };

  externalVehicles: ExternalVehicle[] = [];
  externalVehicleToAdd: ExternalVehicle = new ExternalVehicle('','','','','','','','');
  externalVehicleToEdit: ExternalVehicle = new ExternalVehicle('','','','','','','','');
  temp_visit_type:string[]=['DELIVERY','COLECTIVO','TAXI'];

  searchTerm: string = '';
  externalSearchTerm: string = '';
  selectedBlock: string = '';
  selectedLot: string = '';
  externalSelectedBlock: string = '';
  externalSelectedLot: string = '';

  showViewPhotoDialog = false;
  viewPhotoUrl: string | null = null;
  viewPhotoTitle = '';

  constructor(
    private entranceService: EntranceService,
    private toastr: ToastrService,
    private api: ApiService,
  ){}

  ngOnInit(): void {
    this.entranceService.getAllVehicles().subscribe({
      next: (res: any) => {
        this.vehicles = Array.isArray(res) ? res : (res?.data ?? []);
      },
      error: (err) => { console.error('Error obteniendo vehículos:', err); }
    });
    this.entranceService.getAllHouses().subscribe({
      next: (res: any) => {
        this.houses = Array.isArray(res) ? res : (res?.data ?? []);
      },
      error: (err) => { console.error('Error obteniendo casas:', err); }
    });
    this.entranceService.getAllExternalVehicles().subscribe({
      next: (res: any) => {
        this.externalVehicles = Array.isArray(res) ? res : (res?.data ?? []);
      },
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

  get filteredVehicles(): Vehicle[] {
    if (!this.searchTerm.trim() && !this.selectedBlock && !this.selectedLot) {
      return this.vehicles;
    }
    const search = this.searchTerm.toLowerCase();
    return this.vehicles.filter(v => {
      const matchesSearch = !this.searchTerm.trim() ||
        v.type_vehicle.toLowerCase().includes(search) ||
        v.license_plate.toLowerCase().includes(search);
      
      const house = this.houses.find(h => h.house_id === v.house_id);
      const blockVal = (house?.block_house ?? '').toString();
      const lotVal = (house?.lot ?? '').toString();
      
      const matchesBlock = !this.selectedBlock || blockVal === this.selectedBlock;
      const matchesLot = !this.selectedLot || lotVal === this.selectedLot;
      
      return matchesSearch && matchesBlock && matchesLot;
    });
  }

  get filteredExternalVehicles(): ExternalVehicle[] {
    if (!this.externalSearchTerm.trim() && !this.externalSelectedBlock && !this.externalSelectedLot) {
      return this.externalVehicles;
    }
    const search = this.externalSearchTerm.toLowerCase();
    return this.externalVehicles.filter(ev => {
      const matchesSearch = !this.externalSearchTerm.trim() ||
        ev.temp_visit_type.toLowerCase().includes(search) ||
        ev.temp_visit_plate.toLowerCase().includes(search) ||
        (ev.temp_visit_name && ev.temp_visit_name.toLowerCase().includes(search));
      
      // External vehicles no tienen house_id, así que no filtramos por manzana/lote
      return matchesSearch;
    });
  }

  get uniqueBlocks(): string[] {
    return [...new Set(this.houses.map(h => h.block_house.toString()))].sort();
  }

  get uniqueLots(): string[] {
    const filtered = this.selectedBlock 
      ? this.houses.filter(h => h.block_house.toString() === this.selectedBlock)
      : this.houses;
    return [...new Set(filtered.map(h => h.lot.toString()))].sort((a, b) => parseInt(a) - parseInt(b));
  }

  get uniqueExternalBlocks(): string[] {
    return [...new Set(this.houses.map(h => h.block_house.toString()))].sort();
  }

  get uniqueExternalLots(): string[] {
    const filtered = this.externalSelectedBlock 
      ? this.houses.filter(h => h.block_house.toString() === this.externalSelectedBlock)
      : this.houses;
    return [...new Set(filtered.map(h => h.lot.toString()))].sort((a, b) => parseInt(a) - parseInt(b));
  }

  openViewPhoto(vehicle: Vehicle): void {
    this.viewPhotoUrl = this.api.getPhotoUrl(vehicle.photo_url!);
    this.viewPhotoTitle = vehicle.license_plate ? `Vehículo ${vehicle.license_plate}` : 'Foto';
    this.showViewPhotoDialog = true;
  }

  closeViewPhoto(): void {
    this.showViewPhotoDialog = false;
    this.viewPhotoUrl = null;
  }

  getPhotoUrl(photoUrl: string): string {
    return this.api.getPhotoUrl(photoUrl);
  }

  getVehicleIcon(vehicleType: string): string {
    return this.vehicleTypeIcons[vehicleType] || '🚗';
  }

  getExternalVehicleIcon(vehicleType: string): string {
    return this.externalVehicleTypeIcons[vehicleType] || '🚚';
  }

  getHouseLocation(v: Vehicle): string {
    const house = this.houses.find(h => h.house_id === v.house_id);
    const block = (house?.block_house ?? v.block_house ?? '-').toString().toUpperCase();
    const lot = (house?.lot ?? v.lot ?? '-').toString().toUpperCase();
    const apt = (house?.apartment ?? v.apartment ?? '').toString().trim();
    let result = `MZ:${block} LT:${lot}`;
    if (apt !== '') {
      result += ` DPTO:${apt.toUpperCase()}`;
    }
    return result;
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
  
  //VEHÍCULOS EXTERNOS
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
