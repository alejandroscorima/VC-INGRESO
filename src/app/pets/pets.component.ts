import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Pet, PET_SPECIES, PET_STATUS } from '../pet';
import { PetsService } from '../pets.service';
import { UsersService } from '../users.service';
import { User } from '../user';
import { WebcamComponent } from '../webcam/webcam.component';

@Component({
  selector: 'app-pets',
  templateUrl: './pets.component.html',
  styleUrls: ['./pets.component.css']
})
export class PetsComponent implements OnInit {
  displayedColumns: string[] = ['photo', 'name', 'species', 'breed', 'owner', 'status', 'actions'];
  dataSource: MatTableDataSource<Pet> = new MatTableDataSource<Pet>([]);
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  pets: Pet[] = [];
  owners: User[] = [];
  speciesOptions = PET_SPECIES;
  statusOptions = PET_STATUS;
  
  showAddDialog = false;
  showEditDialog = false;
  showPhotoDialog = false;
  
  newPet: Partial<Pet> = { status_validated: 'PERMITIDO' };
  editPet: Pet | null = null;
  selectedPet: Pet | null = null;
  currentPhotoPet: Pet | null = null;

  constructor(
    private petsService: PetsService,
    private usersService: UsersService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadPets();
    this.loadOwners();
  }

  loadPets(): void {
    this.petsService.getPets().subscribe({
      next: (pets) => {
        this.pets = pets;
        this.dataSource.data = pets;
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      },
      error: (err) => {
        this.toastr.error('Error al cargar mascotas: ' + err.message);
      }
    });
  }

  loadOwners(): void {
    this.usersService.getPersons({}).subscribe({
      next: (persons) => {
        this.owners = persons;
      },
      error: (err) => {
        this.toastr.error('Error al cargar propietarios');
      }
    });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  openAddDialog(): void {
    this.newPet = { 
      name: '', 
      species: 'DOG', 
      breed: '', 
      color: '',
      owner_id: 0,
      status_validated: 'PERMITIDO'
    };
    this.showAddDialog = true;
  }

  openEditDialog(pet: Pet): void {
    this.editPet = { ...pet };
    this.showEditDialog = true;
  }

  openPhotoDialog(pet: Pet): void {
    this.currentPhotoPet = pet;
    this.showPhotoDialog = true;
  }

  createPet(): void {
    if (!this.validatePet(this.newPet)) {
      this.toastr.warning('Por favor complete los campos requeridos');
      return;
    }

    this.petsService.createPet(this.newPet).subscribe({
      next: (created) => {
        this.toastr.success('Mascota registrada exitosamente');
        this.showAddDialog = false;
        this.loadPets();
      },
      error: (err) => {
        this.toastr.error('Error al crear mascota: ' + err.message);
      }
    });
  }

  updatePet(): void {
    if (!this.editPet?.id) return;

    if (!this.validatePet(this.editPet)) {
      this.toastr.warning('Por favor complete los campos requeridos');
      return;
    }

    this.petsService.updatePet(this.editPet.id, this.editPet).subscribe({
      next: () => {
        this.toastr.success('Mascota actualizada');
        this.showEditDialog = false;
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
    return !!(pet.name && pet.species && pet.owner_id);
  }

  onPhotoCaptured(event: { imageBase64: string, imageBlob: Blob }): void {
    if (this.currentPhotoPet?.id) {
      // Convertir base64 a archivo
      const file = this.dataURLtoFile(event.imageBase64, `pet_${this.currentPhotoPet.id}.jpg`);
      
      this.petsService.uploadPetPhoto(this.currentPhotoPet.id, file).subscribe({
        next: (result) => {
          this.toastr.success('Foto actualizada');
          this.showPhotoDialog = false;
          this.loadPets();
        },
        error: (err) => {
          this.toastr.error('Error al subir foto');
        }
      });
    }
  }

  private dataURLtoFile(dataurl: string, filename: string): File {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)![1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  }

  getStatusColor(status: string): string {
    const statusObj = PET_STATUS.find(s => s.value === status);
    return statusObj?.color || 'gray';
  }

  getOwnerName(ownerId: number): string {
    const owner = this.owners.find(o => o.id === ownerId);
    return owner ? `${owner.first_name} ${owner.paternal_surname}` : 'Desconocido';
  }
}
