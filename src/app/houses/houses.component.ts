import { AfterViewInit, Component, OnInit } from '@angular/core';
import { House } from '../house';
import { EntranceService } from '../entrance.service';
import { initFlowbite } from 'flowbite';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-houses',
  templateUrl: './houses.component.html',
  styleUrls: ['./houses.component.css']
})
export class HousesComponent implements OnInit, AfterViewInit{

  houses: House[] = [];

  houseToAdd: House = new House('',0,null,'',0);
  houseToEdit: House = new House('',0,null,'',0);
  
  searchTerm: string = '';
  selectedBlock: string = '';
  selectedLot: string = '';
  currentPage: number = 1;
  pageSize: number = 10;
  pageSizeOptions: number[] = [10, 25, 50, 100];

  constructor(
    private entranceService: EntranceService,
    private toastr: ToastrService,
    private auth: AuthService,
  ) {}

  /** Gestión global: solo administrador crea/edita. Operario: solo lectura. */
  get canManageHousesCrud(): boolean {
    return this.auth.isAdministratorRole();
  }

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

  get filteredHouses(): House[] {
    if (!this.searchTerm.trim() && !this.selectedBlock && !this.selectedLot) {
      return this.houses;
    }
    const search = this.searchTerm.toLowerCase();
    return this.houses.filter(h => {
      const matchesSearch = !this.searchTerm.trim() ||
        h.block_house.toString().toLowerCase().includes(search) ||
        h.lot.toString().toLowerCase().includes(search) ||
        (h.apartment && h.apartment.toLowerCase().includes(search));
      
      const matchesBlock = !this.selectedBlock || h.block_house.toString() === this.selectedBlock;
      const matchesLot = !this.selectedLot || h.lot.toString() === this.selectedLot;
      
      return matchesSearch && matchesBlock && matchesLot;
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

  get housesTotalPages(): number {
    return Math.max(1, Math.ceil(this.filteredHouses.length / this.pageSize));
  }

  get paginatedHouses(): House[] {
    const safePage = Math.min(this.currentPage, this.housesTotalPages);
    if (safePage !== this.currentPage) {
      this.currentPage = safePage;
    }
    const start = (safePage - 1) * this.pageSize;
    return this.filteredHouses.slice(start, start + this.pageSize);
  }

  onPageSizeChange(): void {
    this.currentPage = 1;
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage -= 1;
    }
  }

  nextPage(): void {
    if (this.currentPage < this.housesTotalPages) {
      this.currentPage += 1;
    }
  }
  
  clean(){
    this.houseToAdd = new House('',0,null,'',0);
    this.houseToEdit = new House('',0,null,'',0);
  }
}
