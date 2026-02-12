import { AfterViewInit, Component, OnInit } from '@angular/core';
import { House } from '../house';
import { EntranceService } from '../entrance.service';
import { initFlowbite } from 'flowbite';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-houses',
  templateUrl: './houses.component.html',
  styleUrls: ['./houses.component.css']
})
export class HousesComponent implements OnInit, AfterViewInit{

  houses: House[] = [];

  houseToAdd: House = new House('',0,null,'',0);
  houseToEdit: House = new House('',0,null,'',0);

  constructor(
    private entranceService: EntranceService,
    private toastr: ToastrService,
  ){}

  ngOnInit(){

    this.entranceService.getAllHouses().subscribe((res: any) => {
      const list = Array.isArray(res) ? res : (res?.data ?? []);
      this.houses = list;
    });

  }

  ngAfterViewInit(){
    initFlowbite();
  }

  newHouse(){
    document.getElementById('new-house-button')?.click();
  }

  editHouse(house:House){
    this.houseToEdit=house;
    document.getElementById('edit-house-button')?.click();
  }

  saveNewHouse() {
//CAMPOS OBLIGATORIOS
    if (!this.houseToAdd.block_house || !this.houseToAdd.lot) {
    this.toastr.error('Los campos obligatorios no pueden estar vacíos');
    return;
    }
//HASTA AQUÍ
    this.houseToAdd.status_system = 'ACTIVO';
    this.entranceService.addHouse(this.houseToAdd).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.toastr.success(res.message);
          this.handleSuccess();
        } else {
          this.toastr.error(res.message);
        }
      },
      error: (err) => {
        console.error(err);
        this.toastr.error('Error al guardar la casa');
      }
    });
  }

  saveEditHouse() {
    //CAMPOS OBLIGATORIOS
    if (!this.houseToEdit.block_house || !this.houseToEdit.lot) {
    this.toastr.error('Los campos obligatorios no pueden estar vacíos');
    return;
    }
  //HASTA AQUÍ
    this.entranceService.updateHouse(this.houseToEdit).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.toastr.success(res.message);
          this.handleSuccess();
        } else {
          this.toastr.error(res.message);
        }
      },
      error: (err) => {
        console.error(err);
        this.toastr.error('Error al actualizar la casa');
      }
    });
  }
  

  private handleSuccess() {
    this.clean();
    this.entranceService.getAllHouses().subscribe((res: any[]) => {
      this.houses = res;
    });
  }
  
  clean(){
    this.houseToAdd = new House('',0,null,'',0);
    this.houseToEdit = new House('',0,null,'',0);
  }
}
