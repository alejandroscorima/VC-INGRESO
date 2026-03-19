import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Pet } from '../pet';
import { ApiService } from '../api.service';
import { PetsService } from '../pets.service';
import { UsersService } from '../users.service';
import { User } from '../user';
import { EntranceService } from '../entrance.service';
import { House } from '../house';

@Component({
  selector: 'app-pets',
  templateUrl: './pets.component.html',
  styleUrls: ['./pets.component.css']
})
export class PetsComponent implements OnInit {

  pets: Pet[] = [];
  houses: House[] = [];
  owners: User[] = [];
  
  showViewPhotoDialog = false;
  viewPhotoUrl: string | null = null;
  viewPhotoTitle = '';

  petToAdd: Partial<Pet> = { status_validated: 'PERMITIDO' };
  petToEdit: Pet | null = null;
  
  searchTerm: string = '';
  selectedBlock: string = '';
  selectedLot: string = '';

  constructor(
    private api: ApiService,
    private petsService: PetsService,
    private usersService: UsersService,
    private entranceService: EntranceService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadPets();
    this.loadHouses();
    this.loadOwners();
  }

  /** URL completa para mostrar la foto de la mascota (desde el servidor o API). */
  getPhotoUrl(url: string | null | undefined): string | null {
    return this.api.getPhotoUrl(url);
  }

  loadHouses(): void {
    this.entranceService.getAllHouses().subscribe({
      next: (res: any) => {
        const list = Array.isArray(res) ? res : (res?.data ?? []);
        this.houses = list;
      },
      error: () => this.toastr.error('Error al cargar casas')
    });
  }

  loadPets(): void {
    this.petsService.getPets().subscribe({
      next: (res) => {
        const pets = (res && (res as any).data) ? (res as any).data : (Array.isArray(res) ? res : []);
        this.pets = pets;
      },
      error: (err) => {
        this.toastr.error('Error al cargar mascotas: ' + err.message);
      }
    });
  }

  loadOwners(): void {
    this.usersService.getPersons({}).subscribe({
      next: (res) => {
        const persons = (res && (res as any).data) ? (res as any).data : (Array.isArray(res) ? res : []);
        this.owners = persons;
      },
      error: (err) => {
        this.toastr.error('Error al cargar propietarios');
      }
    });
  }

  newPet(): void {
    this.petToAdd = { 
      name: '', 
      species: 'PERRO', 
      breed: '', 
      color: '',
      house_id: 0,
      status_validated: 'PERMITIDO'
    };
    document.getElementById('new-pet-button')?.click();
  }

  editPet(pet: Pet): void {
    this.petToEdit = { ...pet };
    document.getElementById('edit-pet-button')?.click();
  }

  get filteredPets(): Pet[] {
    if (!this.searchTerm.trim() && !this.selectedBlock && !this.selectedLot) {
      return this.pets;
    }
    const search = this.searchTerm.toLowerCase();
    return this.pets.filter(p => {
      const matchesSearch = !this.searchTerm.trim() ||
        p.name.toLowerCase().includes(search) ||
        p.species.toLowerCase().includes(search) ||
        (p.breed && p.breed.toLowerCase().includes(search));
      
      const house = this.houses.find(h => h.house_id === p.house_id);
      const blockVal = (house?.block_house ?? '').toString();
      const lotVal = (house?.lot ?? '').toString();
      
      const matchesBlock = !this.selectedBlock || blockVal === this.selectedBlock;
      const matchesLot = !this.selectedLot || lotVal === this.selectedLot;
      
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

  openViewPhoto(pet: Pet): void {
    this.viewPhotoUrl = this.api.getPhotoUrl(pet.photo_url);
    this.viewPhotoTitle = pet.name || 'Foto';
    this.showViewPhotoDialog = true;
  }

  closeViewPhoto(): void {
    this.showViewPhotoDialog = false;
    this.viewPhotoUrl = null;
  }

  createPet(): void {
    if (!this.validatePet(this.petToAdd)) {
      this.toastr.warning('Por favor complete los campos requeridos');
      return;
    }

    this.petsService.createPet(this.petToAdd).subscribe({
      next: (created) => {
        this.toastr.success('Mascota registrada exitosamente');
        this.clean();
        this.loadPets();
      },
      error: (err) => {
        this.toastr.error('Error al crear mascota: ' + err.message);
      }
    });
  }

  updatePet(): void {
    if (!this.petToEdit?.id) return;

    if (!this.validatePet(this.petToEdit)) {
      this.toastr.warning('Por favor complete los campos requeridos');
      return;
    }

    this.petsService.updatePet(this.petToEdit.id, this.petToEdit).subscribe({
      next: () => {
        this.toastr.success('Mascota actualizada');
        this.clean();
        this.loadPets();
      },
      error: (err) => {
        this.toastr.error('Error al actualizar: ' + err.message);
      }
    });
  }

  deletePet(pet: Pet): void {
    if (!confirm(`¿Está seguro de eliminar a ${pet.name}?`)) return;

    this.petsService.deletePet(pet.id!).subscribe({
      next: () => {
        this.toastr.success('Mascota eliminada');
        this.loadPets();
      },
      error: (err) => {
        this.toastr.error('Error al eliminar: ' + err.message);
      }
    });
  }

  validatePet(pet: Partial<Pet>): boolean {
    return !!(pet.name && pet.species && pet.house_id);
  }

  getHouseDisplay(pet: Pet): string {
    if (pet.block_house != null && pet.lot != null) {
      return `Mz:${pet.block_house} Lt:${pet.lot}`;
    }
    const house = this.houses.find(h => h.house_id === pet.house_id);
    if (house) return `Mz:${house.block_house} Lt:${house.lot}`;
    return `Casa #${pet.house_id}`;
  }

  getOwnerName(ownerId: number | undefined): string {
    if (ownerId == null) return '-';
    const owner = this.owners.find(o => (o as any).id === ownerId || o.user_id === ownerId);
    return owner ? `${owner.first_name} ${owner.paternal_surname}` : 'Desconocido';
  }

  getPetIcon(species: string): string {
    const icons: { [key: string]: string } = {
      'PERRO': 'pets',
      'GATO': 'pets',
      'AVE': 'pets',
      'PEQUEÑO MAMÍFERO': 'pets',
      'ACUÁTICO': 'pets',
      'EXÓTICO': 'pets',
      'OTRO': 'pets'
    };
    return icons[species] || 'pets';
  }

  clean(): void {
    this.petToAdd = { status_validated: 'PERMITIDO' };
    this.petToEdit = null;
  }
}
